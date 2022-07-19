//Logic for the first scene by nektarios neroutsos.
///#############################
///The following script has the convention of always requesting an animation frame to allow for dynamic canvas resizing
///For a better responsive design.

//Canvas/Webgl Variables
var GL;
var Canvas;
var ShadersProgram;

//Cube Buffers
var CubeVerticesBuffer;

var HeadCoordsTextureBuffer;
var ChestCoordsTextureBuffer;
var HandsCoordsTextureBuffer;
var LegsCoordsTextureBuffer;
var FeetCoordsTextureBuffer;
var SkyboxCoordsTextureBuffer;
var GroundCoordsTextureBuffer;

var CubeIndexBuffer;
var SkyboxIndexBuffer;

//Camera Buffers
var ViewMatrix = new Float32Array(16);
var PerspectiveMatrix = new Float32Array(16);
var PerspectiveViewMatrix = new Float32Array(16);

//Camera Vars
var AnimateCamera = false;
var WasAnimated = false;

//Animation Vars
var HeadAnimationRotationTotal = 0;
var TorsoAnimationRotationTotal = 0;
var LHandAnimationRotationTotal = 0;
var RHandAnimationRotationTotal = 0;
var LLegAnimationRotationTotal = 0;
var RLegAnimationRotationTotal = 0;

var WalkAnimSpeedHead = 0.01;
var WalkAnimSpeedTorso = 0.005;
var WalkAnimSpeedHands = 0.02;
var WalkAnimSpeedLegs = 0.04;

var DropAnimSpeed = 0.04;
var RiseAnimSpeed = 0.01;
var CurOnOffSpeed = 0.04;

var OffReturnMultiplier = 1;

var SpinHeadBackMultiplier = 1;
var SpinLLegBackMultiplier = 1;
var SpinRLegBackMultiplier = 1;
var SpinLHandBackMultiplier = 1;
var SpinRHandBackMultiplier = 1;

var DanceRandomHeadSpeed = 0;
var DanceRandomTorsoSpeed =0;
var DanceRandomLHandSpeed = 0;
var DanceRandomRHandSpeed = 0
var DanceRandomLLegSpeed = 0;
var DanceRandomRLegSpeed = 0;


var AnimationRotationStep = 0.1;

//Shaders Buffers
var VertexPositionAttributePointer;
var TextureCoordsAttributePointer;

var PerspectiveUniformPointer;
var TranslateUniformPointer;

var SamplerPointer;

var HeadTexture;
var ChestTexture;
var HandsTexture;
var LegsTexture;
var FeetTexture;
var SkyboxTexture;
var GroundTexture;


//Matrix buffers to avoid constant reallocs
var TranslateMatrix = new Float32Array(16);
var ScaleMatrix = new Float32Array(16);
var RotationMatrix = new Float32Array(16);
var TranslateScaleMatrix = new Float32Array(16);
var RotationTranslateScaleMatrix = new Float32Array(16);

//Refreshing the window
var AnimationRequestID = 0;

//HTML Vars
var ViewAngle;
var RotationStep;
var ViewDistance;
var CameraPosition;
var AnimationType = "";
var PreviousAnimationType = "";
var Rect;

//Mouse
var MouseWheelInput = 0;
var XMove = 0.0;
var YMove = 0.0;
var LastMouseX = 0.0;
var LastMouseY = 0.0;
var MouseHeld = false;

function Main()
{
    Setup();
    ScaleCanvas();
    StartRendering();
}

//Rescale dynamically.
function ScaleCanvas()
{
    GL.clear(GL.COLOR_BUFFER_BIT| GL.DEPTH_BUFFER_BIT);
    //Most aspect ratios tend to be more width heavy, we ofcourse check first which is the biggest ratio.
    var min = window.innerWidth >= window.innerHeight ?  0.8 * window.innerHeight : 0.8 * window.innerWidth;

    //Return if we havent resized
    if(min == Canvas.width && min == Canvas.height)
    {
        return;
    }
    Canvas.width = min;
    Canvas.height = min;
    GL.clearColor(0.4, 0.4, 0.4, 1.0);
    GL.viewport(0,0, GL.drawingBufferWidth, GL.drawingBufferHeight);
}

//General Variable Setup
function Setup()
{
    Canvas = document.querySelector('#sceneCanvas');
    GL = WebGLDebugUtils.makeDebugContext(CreateWebGLContext(Canvas));
    GL.enable(GL.DEPTH_TEST);
    GL.frontFace(GL.CCW);
    GL.enable(GL.CULL_FACE);
    GL.cullFace(GL.BACK);
    Rect = Canvas.getBoundingClientRect();

    LastMouseX = 0;
    LastMouseY = 0;

    Canvas.onmousedown = (event) => {
        LastMouseY = event.clientX - Rect.left;
        LastMouseY = Rect.bottom - event.clientY;;
        if(AnimateCamera)
        {
            WasAnimated = true;
        }
        AnimateCamera = false;
        MouseHeld = true;
    };
    window.onmouseup = (event) =>
    {
        if(WasAnimated)
        {
            AnimateCamera = true;
        }
        MouseHeld = false;
    };
    Canvas.onmousemove = (event) =>
    {
        if(MouseHeld)
        {
            var currMouseX = event.clientX - Rect.left;
            var currMouseY = Rect.bottom - event.clientY;
            XMove += 0.6 * (currMouseX - LastMouseX);
            YMove += 0.6 * (currMouseY - LastMouseY);
            LastMouseX = currMouseX;
            LastMouseY = currMouseY;
        }
    }


    addEventListener('wheel', (evt) => {
            MouseWheelInput += evt.deltaY > 0 ? -0.2 * AnimationRotationStep : 0.2 * AnimationRotationStep;
            MouseWheelInput = MouseWheelInput >= 32 ? 32 : MouseWheelInput <= -32 ? -32 : MouseWheelInput;
    });

    SetupObjectBuffers();
    SetupShaders()
}

function CreateWebGLContext(inCanvas) {
    var fetchedContext = null;
    //Is Webgl Supported?
    fetchedContext = inCanvas.getContext("webgl");
    if (!fetchedContext) //Try with legacy
    {
        fetchedContext = inCanvas.getContext("experimental-webgl");
    }
    //Webgl is not supported in this device and/or browser.
    if (!fetchedContext) {
        alert("Webgl is not supported, try using a different browser or deleting your cookies\nEnsure any Add-ons are not interfering");
    }
    //Return the null or not context
    return fetchedContext;
}

function SetupObjectBuffers()
{
    //============ cube
    var cubeVerticesBufferData = new Float32Array([
        // - Front Face
        -1.0, 1.0, 1.0, 1.0, //0
        -1.0, -1.0, 1.0, 1.0, //1
        1.0, -1.0, 1.0, 1.0, //2
        1.0, 1.0, 1.0, 1.0, //3

        // - Right Face
        1.0, 1.0, 1.0, 1.0, //4
        1.0, -1.0, 1.0, 1.0, //5
        1.0, -1.0, -1.0, 1.0, //6
        1.0, 1.0, -1.0, 1.0, //7

        // - Left Face
        -1.0, 1.0, -1.0, 1.0, //8
        -1.0, -1.0, -1.0, 1.0, //9
        -1.0, -1.0, 1.0, 1.0, //10
        -1.0, 1.0, 1.0, 1.0, //11

        // - Back Face
        1.0, 1.0, -1.0, 1.0, //12
        1.0, -1.0, -1.0, 1.0, //13
        -1.0, -1.0, -1.0, 1.0, //14
        -1.0, 1.0, -1.0, 1.0, //15

        // - Top Face
        -1.0, 1.0, -1.0, 1.0, //16
        -1.0, 1.0, 1.0, 1.0, //17
        1.0, 1.0, 1.0, 1.0, //18
        1.0, 1.0, -1.0, 1.0, //19

        // - Bottom Face
        -1.0, -1.0, 1.0, 1.0, //20
        -1.0, -1.0, -1.0, 1.0, //21
        1.0, -1.0, -1.0, 1.0, //22
        1.0, -1.0, 1.0, 1.0, //23
    ]);


    var cubeIndexBufferData = new Uint16Array([
        //Front
        0,1,2,
        2,3,0,

        //Right
        4,5,6,
        6,7,4,

        //Left
        8,9,10,
        10,11,8,

        //Back
        12,13,14,
        15,12,14,

        //Top
        16,17,18,
        18,19,16,

        //Bottom
        20,21,22,
        22,23,20,
    ]);

    var headTextureCoordinates = new Float32Array([
        //Front
        0.333, 0.277,
        0.333, 0.499,
        0.667, 0.499,
        0.667, 0.277,

        //Right
        0.111, 0.499,
        0.333, 0.499,
        0.333, 0.777,
        0.111, 0.777,

        //Left
        0.667, 0.499,
        0.889, 0.499,
        0.889, 0.777,
        0.667, 0.777,

        //Back
        0.333, 0.777,
        0.333, 1.0,
        0.667, 1.0,
        0.667, 0.777,

        //Top
        0.333, 0.0,
        0.667, 0.0,
        0.667, 0.277,
        0.333, 0.277,

        //Bottom
        0.333, 0.499,
        0.333, 0.777,
        0.667, 0.777,
        0.667, 0.499,
    ]);

    var chestTextureCoordinates = new Float32Array([
        //Front
        0.36, 0.35,
        0.36, 0.5,
        0.64, 0.5,
        0.64, 0.35,

        //Right
        0.2, 0.85,
        0.36, 0.85,
        0.36, 0.5,
        0.2, 0.5,

        //Left
        0.64, 0.5,
        0.8, 0.5,
        0.8, 0.85,
        0.64, 0.85,

        //Back
        0.36, 0.85,
        0.36, 1.0,
        0.64, 1.0,
        0.64, 0.85,

        //Top
        0.36, 0.0,
        0.36, 0.35,
        0.64, 0.35,
        0.64, 0.0,

        //Bottom
        0.36, 0.850,
        0.36, 0.5,
        0.64, 0.5,
        0.64, 0.850,
    ]);

    var handsTextureCoordinates = new Float32Array([
        //Front
        0.464, 0.358,
        0.461, 0.501,
        0.536, 0.501,
        0.536, 0.358,

        //Right
        0.321, 0.858,
        0.464, 0.858,
        0.464, 0.501,
        0.321, 0.501,

        //Left
        0.536, 0.501,
        0.679, 0.501,
        0.679, 0.858,
        0.536, 0.858,

        //Back
        0.464, 0.858,
        0.464, 1.0,
        0.536, 1.0,
        0.536, 0.858,

        //Top
        0.464, 0.0,
        0.464, 0.358,
        0.536, 0.358,
        0.536, 0.0,

        //Bottom
        0.464, 0.858,
        0.464, 0.501,
        0.536, 0.501,
        0.536, 0.858,
    ]);

    var legsTextureCoordinates = new Float32Array([
        //Front
        0.409, 0.365,
        0.409, 0.502,
        0.591, 0.502,
        0.591, 0.365,

        //Right
        0.273, 0.865,
        0.409, 0.865,
        0.409, 0.502,
        0.273, 0.502,

        //Left
        0.591, 0.502,
        0.727, 0.502,
        0.727, 0.865,
        0.591, 0.865,

        //Back
        0.409, 0.865,
        0.409, 1.0,
        0.591, 1.0,
        0.591, 0.865,

        //Top
        0.409, 0.0,
        0.409, 0.365,
        0.591, 0.365,
        0.591, 0.0,

        //Bottom
        0.409, 0.865,
        0.409, 0.502,
        0.591, 0.502,
        0.591, 0.865,
    ]);

    var feetTextureCoordinates = new Float32Array([
        //Front
        0.376, 0.127,
        0.376, 0.5,
        0.624, 0.5,
        0.624, 0.127,

        //Right
        0.0, 0.624,
        0.376, 0.624,
        0.376, 0.5,
        0.0, 0.5,

        //Left
        0.624, 0.5,
        0.624, 0.624,
        1.0, 0.624,
        1.0, 0.5,

        //Back
        0.376, 0.624,
        0.376, 1.0,
        0.624, 1.0,
        0.624, 0.624,

        //Top
        0.376, 0.0,
        0.376, 0.127,
        0.624, 0.127,
        0.624, 0.0,

        //Bottom
        0.376, 0.624,
        0.376, 0.5,
        0.624, 0.5,
        0.624, 0.624,
    ]);

    var skyboxTextureCoordinates = new Float32Array([
        //Front
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        //Right
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,

        //Left
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        //Back
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        //Top
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        //Bottom
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
    ]);

    var groundTextureCoordinates = new Float32Array([
        //Front
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        //Right
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,

        //Left
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        //Back
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        //Top
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        //Bottom
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
    ]);

    var skyboxIndexBufferData = new Uint16Array([
        //Front
        0,2,1,
        2,0,3,

        //Right
        4,6,5,
        7,6,4,

        //Left
        8,10,9,
        8,11,10,

        //Back
        12,14,13,
        15,14,12,

        //Top
        16,18,17,
        19,18,16,

        //Bottom
        20,22,21,
        20,23,22,
    ]);

    //Feed Data Into Respective Buffers
    CubeVerticesBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, cubeVerticesBufferData, GL.STATIC_DRAW);
    CubeVerticesBuffer.itemSize = 4;
    CubeVerticesBuffer.itemCount = 28;


    CubeIndexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CubeIndexBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, cubeIndexBufferData, GL.STATIC_DRAW);
    CubeIndexBuffer.itemCount = 36;

    SkyboxIndexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SkyboxIndexBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, skyboxIndexBufferData, GL.STATIC_DRAW);
    SkyboxIndexBuffer.itemCount = 36;

    SkyboxCoordsTextureBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SkyboxCoordsTextureBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, skyboxTextureCoordinates, GL.STATIC_DRAW);
    SkyboxCoordsTextureBuffer.itemSize = 2;

    GroundCoordsTextureBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, GroundCoordsTextureBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, groundTextureCoordinates, GL.STATIC_DRAW);
    GroundCoordsTextureBuffer.itemSize = 2;

    HeadCoordsTextureBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, HeadCoordsTextureBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, headTextureCoordinates, GL.STATIC_DRAW);
    HeadCoordsTextureBuffer.itemSize = 2;

    ChestCoordsTextureBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, ChestCoordsTextureBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, chestTextureCoordinates, GL.STATIC_DRAW);
    ChestCoordsTextureBuffer.itemSize = 2;

    HandsCoordsTextureBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, HandsCoordsTextureBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, handsTextureCoordinates, GL.STATIC_DRAW);
    HandsCoordsTextureBuffer.itemSize = 2;

    LegsCoordsTextureBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, LegsCoordsTextureBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, legsTextureCoordinates, GL.STATIC_DRAW);
    LegsCoordsTextureBuffer.itemSize = 2;

    FeetCoordsTextureBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, FeetCoordsTextureBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, feetTextureCoordinates, GL.STATIC_DRAW);
    FeetCoordsTextureBuffer.itemSize = 2;

    //All UV + Textures Made By Me
    HeadTexture = GL.createTexture();
    var headImgURL = "../../Images/UVS/Head.png";
    TextureLoader(headImgURL, HeadTexture);

    SkyboxTexture = GL.createTexture();
    var skyImgURL = "../../Images/SkyBox.png";
    TextureLoader(skyImgURL, SkyboxTexture);

    GroundTexture = GL.createTexture();
    var groundImgURL = "../../Images/Ground.png";
    TextureLoader(groundImgURL, GroundTexture);

    ChestTexture = GL.createTexture();
    var bodyImgURL = "../../Images/UVS/Body.png";
    TextureLoader(bodyImgURL, ChestTexture);

    HandsTexture = GL.createTexture();
    var handsImgURL = "../../Images/UVS/Hands.png";
    TextureLoader(handsImgURL, HandsTexture);

    LegsTexture = GL.createTexture();
    var legsImgURL = "../../Images/UVS/Legs.png";
    TextureLoader(legsImgURL, LegsTexture);

    FeetTexture = GL.createTexture();
    var feetImgURL = "../../Images/UVS/Feet.png";
    TextureLoader(feetImgURL, FeetTexture);
}

function SetupShaders()
{
    //Source codes for the shaders
    const vertexShaderSourceCode = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoords;
    
    uniform mat4 uPerspectiveMatrix;
    uniform mat4 uTranslateMatrix;
    
    varying vec2 vTextureCoords;
    
    void main()
    {
        gl_Position = uPerspectiveMatrix  * uTranslateMatrix * aVertexPosition;
        vTextureCoords = aTextureCoords;
    }
    `;

    const fragmentShaderSourceCode = `
    precision mediump float; 
    
    varying vec2 vTextureCoords;
    uniform sampler2D uSampler;
    
    void main()
    {
        gl_FragColor = texture2D(uSampler, vTextureCoords);
    }
    `;

    //Create buffers and compile the shader codes.
    var vertexCompiledShader = GL.createShader(GL.VERTEX_SHADER);
    GL.shaderSource(vertexCompiledShader, vertexShaderSourceCode);
    GL.compileShader(vertexCompiledShader);

    if(! GL.getShaderParameter(vertexCompiledShader, GL.COMPILE_STATUS))
    {
        alert("Vertex Shader compilation error: " + GL.getShaderInfoLog(vertexCompiledShader));
        GL.deleteShader(vertexCompiledShader);
        vertexCompiledShader = null;
    }

    var fragmentCompiledShader = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(fragmentCompiledShader, fragmentShaderSourceCode);
    GL.compileShader(fragmentCompiledShader);

    if(! GL.getShaderParameter(fragmentCompiledShader, GL.COMPILE_STATUS))
    {
        alert("Fragment Shader compilation error: " + GL.getShaderInfoLog(fragmentCompiledShader));
        GL.deleteShader(fragmentCompiledShader);
        fragmentCompiledShader = null;
    }

    //Link The Shaders Together
    ShadersProgram = GL.createProgram();
    GL.attachShader(ShadersProgram, vertexCompiledShader);
    GL.attachShader(ShadersProgram, fragmentCompiledShader);
    GL.linkProgram(ShadersProgram);

    //Use said program
    GL.useProgram(ShadersProgram);

    //Connect - Init Attributes & Uniforms
    VertexPositionAttributePointer = GL.getAttribLocation(ShadersProgram, "aVertexPosition");
    GL.enableVertexAttribArray(VertexPositionAttributePointer);

    TextureCoordsAttributePointer = GL.getAttribLocation(ShadersProgram, "aTextureCoords");
    GL.enableVertexAttribArray(TextureCoordsAttributePointer);

    SamplerPointer = GL.getUniformLocation(ShadersProgram, "uSampler");
    PerspectiveUniformPointer = GL.getUniformLocation(ShadersProgram, "uPerspectiveMatrix");
    TranslateUniformPointer = GL.getUniformLocation(ShadersProgram, "uTranslateMatrix");
}

function RenderScene()
{
    //Adjust canvas to current resolution ================================================
    ScaleCanvas();

    //Camera Logic ================================================
    var cameraPositionRef = document.querySelector('input[name="CameraPositions"]:checked');
    CameraPosition = cameraPositionRef ? cameraPositionRef.value : "";

    var viewDistanceRef = document.querySelector('#viewDistance');
    ViewDistance = viewDistanceRef ? parseFloat( viewDistanceRef.value) : 0.0;

    var viewAngleRef = document.querySelector('#viewAngle');
    ViewAngle = viewAngleRef ? parseFloat(viewAngleRef.value) : 0.0;

    var rotationStepRef = document.querySelector('#viewRotation');
    RotationStep = rotationStepRef ? parseFloat( rotationStepRef.value) : 0.0;

    var cameraPositionVec = new Float32Array([0,0,0]);
    switch(CameraPosition)
    {
        case "LeftFrontTop":
            cameraPositionVec = new Float32Array([-ViewDistance, -ViewDistance, ViewDistance]);
            break;
        case "LeftFrontBottom":
            cameraPositionVec = new Float32Array([-ViewDistance, -ViewDistance, -ViewDistance]);
            break;
        case "LeftBackTop":
            cameraPositionVec = new Float32Array([-ViewDistance, ViewDistance, ViewDistance]);
            break;
        case "LeftBackBottom":
            cameraPositionVec = new Float32Array([-ViewDistance, ViewDistance, -ViewDistance]);
            break;
        case "RightFrontTop":
            cameraPositionVec = new Float32Array([ViewDistance, -ViewDistance, ViewDistance]);
            break;
        case "RightFrontBottom":
            cameraPositionVec = new Float32Array([ViewDistance, -ViewDistance, -ViewDistance]);
            break;
        case "RightBackTop":
            cameraPositionVec = new Float32Array([ViewDistance, ViewDistance, ViewDistance]);
            break;
        case "RightBackBottom":
            cameraPositionVec = new Float32Array([ViewDistance, ViewDistance, -ViewDistance]);
            break;
        default:
            cameraPositionVec = new Float32Array([1,1,1]);
            break;
    }

    if(AnimateCamera)
    {
        YMove += RotationStep;
        XMove += RotationStep;
    }
    else if(!MouseHeld)
    {
        XMove = ViewAngle;
        YMove = ViewAngle;
    }

    var totalX = XMove * Math.PI/180.0;
    var totalY = YMove * Math.PI/180.0;

    cameraPositionVec[0] *= Math.cos(totalX);
    cameraPositionVec[1] *= Math.sin(totalY);

    glMatrix.mat4.lookAt(ViewMatrix, cameraPositionVec, [0,0,0], [0,0,1]);
    glMatrix.mat4.perspective(PerspectiveMatrix, (Math.PI / 180) * 90, 1, 0.01, 10000);
    glMatrix.mat4.multiply(PerspectiveViewMatrix, PerspectiveMatrix, ViewMatrix);


    GL.uniformMatrix4fv(PerspectiveUniformPointer, false, new Float32Array(PerspectiveViewMatrix));

    //Skybox ===========================================
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SkyboxIndexBuffer);

    glMatrix.mat4.fromScaling(ScaleMatrix, new Float32Array([5000, 5000, 5000]));
    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(ScaleMatrix));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D, SkyboxTexture);
    GL.uniform1i(SamplerPointer, 0);
    GL.bindBuffer(GL.ARRAY_BUFFER, SkyboxCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, SkyboxCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);
    GL.drawElements(GL.TRIANGLES, SkyboxIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Ground ==================================================
    glMatrix.mat4.fromScaling(ScaleMatrix, new Float32Array([50,50,1]));
    glMatrix.mat4.fromTranslation(TranslateMatrix, new Float32Array([0,0,-1]));
    glMatrix.mat4.multiply(TranslateScaleMatrix, TranslateMatrix, ScaleMatrix);

    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(TranslateScaleMatrix));

    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);


    GL.activeTexture(GL.TEXTURE1);
    GL.bindTexture(GL.TEXTURE_2D, GroundTexture);
    GL.uniform1i(SamplerPointer, 1);
    GL.bindBuffer(GL.ARRAY_BUFFER, GroundCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, GroundCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Animation Type ===========================================
    var AnimationTypeRef = document.querySelector('input[name="Animation"]:checked');
    AnimationType = AnimationTypeRef ? AnimationTypeRef.value : "";

    //On Type Change Reset Wheel Properties
    if(AnimationType !== PreviousAnimationType)
    {
        if(PreviousAnimationType === "Dance" || PreviousAnimationType=== "On/Off" || PreviousAnimationType === "Walk")
        {
            StopSpinCamera();
        }
        if(AnimationType === "Dance" || AnimationType === "On/Off" || AnimationType === "Walk")
        {
            StartSpinCamera();
        }
        ResetAnimation();
        PreviousAnimationType = AnimationType;
    }

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CubeIndexBuffer);
    //Head ================================================
    var headVertexOffset = new Float32Array([0,1,24.5]);

    var headVertexScale = new Float32Array([3,2,2.5]);

    var headGoal = new Float32Array(16);

    var headRot;
    if(AnimationType === "Head")
    {
        //Conventional Move On the positive axis cause it looks better.
        HeadAnimationRotationTotal += MouseWheelInput / Math.PI * 180;

        if(HeadAnimationRotationTotal < -90) {
            HeadAnimationRotationTotal = -90;
        }
        else if(HeadAnimationRotationTotal  > 90)
            HeadAnimationRotationTotal = 90;


        headRot = HeadAnimationRotationTotal/180 * Math.PI;
        SetPosition(headGoal, headVertexOffset, headVertexScale,new Float32Array([0,0,-4]), headRot, new Float32Array([0,0,1]));
    }
    else if(AnimationType === "Walk")
    {
        //Head bobbing
        HeadAnimationRotationTotal += WalkAnimSpeedHead / Math.PI * 180;

        if(HeadAnimationRotationTotal < -15) {
            HeadAnimationRotationTotal = -15;
            WalkAnimSpeedHead *= -1;
        }
        else if(HeadAnimationRotationTotal  > 15) {
            HeadAnimationRotationTotal = 15;
            WalkAnimSpeedHead *= -1;
        }

        headRot = HeadAnimationRotationTotal/180 * Math.PI;
        SetPosition(headGoal, headVertexOffset, headVertexScale,new Float32Array([0,0,-4]), headRot, new Float32Array([0,0,1]));
    }
    else if(AnimationType === "Dance")
    {
        DanceRandomHeadSpeed = (Math.random() * (0.09 * SpinHeadBackMultiplier) / (1));
        HeadAnimationRotationTotal += DanceRandomHeadSpeed / Math.PI * 180;

        if(HeadAnimationRotationTotal < -90) {
            HeadAnimationRotationTotal = -90;
            SpinHeadBackMultiplier *= -1;
        }
        else if(HeadAnimationRotationTotal  > 90)
        {
            HeadAnimationRotationTotal = 90;
            SpinHeadBackMultiplier *= -1;
        }
        headRot = HeadAnimationRotationTotal/180 * Math.PI;
        SetPosition(headGoal, headVertexOffset, headVertexScale,new Float32Array([0,0,-4]), headRot, new Float32Array([0,0,1]));
    }
    else if(AnimationType === "On/Off")
    {
        HeadAnimationRotationTotal -= CurOnOffSpeed * OffReturnMultiplier / Math.PI * 180;

        if(HeadAnimationRotationTotal < -90) {
            HeadAnimationRotationTotal = -90;
            OffReturnMultiplier *= -1;
            CurOnOffSpeed = RiseAnimSpeed;
        }
        else if(HeadAnimationRotationTotal  > 0) {
            HeadAnimationRotationTotal = 0;
            OffReturnMultiplier *= -1;
            CurOnOffSpeed = DropAnimSpeed;
        }

        headRot = HeadAnimationRotationTotal/180 * Math.PI;

        //In order to touch the characters heels we offset by 2 to everything (due to the size of the feet)
        SetPosition(headGoal, headVertexOffset, headVertexScale,new Float32Array([-headVertexOffset[0],-headVertexOffset[1] + 2,-headVertexOffset[2]]), headRot, new Float32Array([1,0,0]));
    }
    else
    {
        //Error avoidance case
        headRot = HeadAnimationRotationTotal/180 * Math.PI;
        SetPosition(headGoal, headVertexOffset, headVertexScale,new Float32Array([0,0,-4]), headRot, new Float32Array([0,0,1]));
    }


    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(headGoal));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);


    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D, HeadTexture);
    GL.uniform1i(SamplerPointer, 0);
    GL.bindBuffer(GL.ARRAY_BUFFER, HeadCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, HeadCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);


    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Torso ================================================
    var torsoVertexOffset = new Float32Array([0,0,16]);


    var torsoVertexScale = new Float32Array([5,3,6]);

    var torsoGoal = new Float32Array(16);

    var torsoRot;

    if(AnimationType === "Walk") {
        TorsoAnimationRotationTotal -= WalkAnimSpeedTorso / Math.PI * 180;

        if (TorsoAnimationRotationTotal < -10) {
            TorsoAnimationRotationTotal = -10;
            WalkAnimSpeedTorso *= -1;
        } else if (TorsoAnimationRotationTotal > 10) {
            TorsoAnimationRotationTotal = 10;
            WalkAnimSpeedTorso *= -1;
        }

        torsoRot = TorsoAnimationRotationTotal/180 * Math.PI;
        SetPosition(torsoGoal, torsoVertexOffset, torsoVertexScale, [0,1,0], torsoRot, [0,0,1]);
    }
    else if(AnimationType === "Dance") {
        DanceRandomTorsoSpeed = (Math.random() * (0.09 + 0.09) / (1) - 0.09);
        TorsoAnimationRotationTotal += DanceRandomTorsoSpeed / Math.PI * 180;

        if (TorsoAnimationRotationTotal < -15) {
            TorsoAnimationRotationTotal = -15;
        } else if (TorsoAnimationRotationTotal > 15) {
            TorsoAnimationRotationTotal = 15;
        }
        torsoRot = TorsoAnimationRotationTotal/180 * Math.PI;
        SetPosition(torsoGoal, torsoVertexOffset, torsoVertexScale, [0,1,0], torsoRot, [0,0,1]);
    }
    else if(AnimationType === "On/Off")
    {
        TorsoAnimationRotationTotal -= CurOnOffSpeed * OffReturnMultiplier / Math.PI * 180;

        if (TorsoAnimationRotationTotal < -90) {
            TorsoAnimationRotationTotal = -90;
        } else if (TorsoAnimationRotationTotal > 0) {
            TorsoAnimationRotationTotal = 0;
        }

        torsoRot = TorsoAnimationRotationTotal/180 * Math.PI;
        SetPosition(torsoGoal, torsoVertexOffset, torsoVertexScale, new Float32Array([-torsoVertexOffset[0],-torsoVertexOffset[1] + 2,-torsoVertexOffset[2]]), torsoRot, [1,0,0]);
    }
    else
    {
        torsoRot = TorsoAnimationRotationTotal/180 * Math.PI;
        SetPosition(torsoGoal, torsoVertexOffset, torsoVertexScale, [0,1,0], torsoRot, [0,0,1]);
    }


    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(torsoGoal));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.activeTexture(GL.TEXTURE1);
    GL.bindTexture(GL.TEXTURE_2D, ChestTexture);
    GL.uniform1i(SamplerPointer, 1);
    GL.bindBuffer(GL.ARRAY_BUFFER, ChestCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, ChestCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Left Hand ================================================
    var lHandVertexScale = new Float32Array([1,2,5]);
    glMatrix.mat4.fromScaling(ScaleMatrix, lHandVertexScale);

    var lHandVertexOffset = new Float32Array([-6,0,17]);
    var lHandRot;
    var lHandGoal = new Float32Array(16);

    if(AnimationType === "LeftHand")
    {
        //Inverse due to looking at -Y
        LHandAnimationRotationTotal -= MouseWheelInput / Math.PI * 180;

        if(LHandAnimationRotationTotal < -90) {
            LHandAnimationRotationTotal = -90;
        }
        else if(LHandAnimationRotationTotal > 0)
            LHandAnimationRotationTotal = 0;

        lHandRot = LHandAnimationRotationTotal/180 * Math.PI;
        SetPosition(lHandGoal, lHandVertexOffset, lHandVertexScale, new Float32Array([0,0,3]), lHandRot, new Float32Array([1,0,0]));
    }
    else if(AnimationType === "Walk")
    {
        //Inverse due to looking at -Y
        LHandAnimationRotationTotal -= WalkAnimSpeedHands / Math.PI * 180;

        if(LHandAnimationRotationTotal < -90) {
            LHandAnimationRotationTotal = -90;
        }
        else if(LHandAnimationRotationTotal > 0)
            LHandAnimationRotationTotal = 0;

        lHandRot = LHandAnimationRotationTotal/180 * Math.PI;
        SetPosition(lHandGoal, lHandVertexOffset, lHandVertexScale, new Float32Array([0,0,3]), lHandRot, new Float32Array([1,0,0]));
    }
    else if(AnimationType === "Dance") {
        DanceRandomLHandSpeed = Math.random() * 0.09 * SpinLHandBackMultiplier;
        LHandAnimationRotationTotal -= DanceRandomLHandSpeed / Math.PI * 180;

        if (LHandAnimationRotationTotal < -90) {
            LHandAnimationRotationTotal = -90;
            SpinLHandBackMultiplier *= -1;
        } else if(LHandAnimationRotationTotal > 0) {
            LHandAnimationRotationTotal = 0;
            SpinLHandBackMultiplier *= -1;
        }

        lHandRot = LHandAnimationRotationTotal/180 * Math.PI;
        SetPosition(lHandGoal, lHandVertexOffset, lHandVertexScale, new Float32Array([0,0,4]), lHandRot, new Float32Array([1,-1,0]));
    }
    else if(AnimationType === "On/Off")
    {
        //Inverse due to looking at -Y
        LHandAnimationRotationTotal -= CurOnOffSpeed * OffReturnMultiplier / Math.PI * 180;

        if(LHandAnimationRotationTotal < -90) {
            LHandAnimationRotationTotal = -90;
        }
        else if(LHandAnimationRotationTotal > 0)
            LHandAnimationRotationTotal = 0;

        lHandRot = LHandAnimationRotationTotal/180 * Math.PI;
        SetPosition(lHandGoal, lHandVertexOffset, lHandVertexScale, new Float32Array([-lHandVertexOffset[0], -lHandVertexOffset[1] + 2, -lHandVertexOffset[2]]), lHandRot, new Float32Array([1,0,0]));
    }
    else
    {
        lHandRot = LHandAnimationRotationTotal/180 * Math.PI;
        SetPosition(lHandGoal, lHandVertexOffset, lHandVertexScale, new Float32Array([0,0,3]), lHandRot, new Float32Array([1,0,0]));
    }


    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(lHandGoal));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.activeTexture(GL.TEXTURE2);
    GL.bindTexture(GL.TEXTURE_2D, HandsTexture);
    GL.uniform1i(SamplerPointer, 2);
    GL.bindBuffer(GL.ARRAY_BUFFER, HandsCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, HandsCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Right Hand ==================================
    var rHandVertexScale = new Float32Array([1,2,5]);
    glMatrix.mat4.fromScaling(ScaleMatrix, rHandVertexScale);

    var rHandVertexOffset = new Float32Array([6,0,17]);


    var rHandRot = 0.0;
    var rHandGoal = new Float32Array(16);

    if(AnimationType === "RightHand")
    {
        //Inverse due to looking at -Y
        RHandAnimationRotationTotal -= MouseWheelInput / Math.PI * 180;

        if(RHandAnimationRotationTotal < -90) {
            RHandAnimationRotationTotal = -90;
        }
        else if(RHandAnimationRotationTotal > 0)
            RHandAnimationRotationTotal = 0;

        rHandRot = RHandAnimationRotationTotal/180 * Math.PI;

        SetPosition(rHandGoal, rHandVertexOffset, rHandVertexScale, new Float32Array([0,0,3]), rHandRot, new Float32Array([1,0,0]));
    }
    else if(AnimationType === "Walk")
    {
        //Non inverse for walking actions
        RHandAnimationRotationTotal += WalkAnimSpeedHands / Math.PI * 180;

        if(RHandAnimationRotationTotal < -90) {
            RHandAnimationRotationTotal = -90;
            WalkAnimSpeedHands *= -1;
        }
        else if(RHandAnimationRotationTotal > 0) {
            RHandAnimationRotationTotal = 0;
            WalkAnimSpeedHands *= -1;
        }

        rHandRot = RHandAnimationRotationTotal/180 * Math.PI;

        SetPosition(rHandGoal, rHandVertexOffset, rHandVertexScale, new Float32Array([0,0,3]), rHandRot, new Float32Array([1,0,0]));
    }
    else if(AnimationType === "Dance") {
        DanceRandomRHandSpeed = Math.random() * 0.05 * SpinRHandBackMultiplier;
        RHandAnimationRotationTotal -= DanceRandomRHandSpeed / Math.PI * 180;

        if (RHandAnimationRotationTotal < -90) {
            RHandAnimationRotationTotal = -90;
            SpinRHandBackMultiplier *= -1;
        } else if(RHandAnimationRotationTotal > 0) {
            RHandAnimationRotationTotal = 0;
            SpinRHandBackMultiplier *= -1;
        }

        rHandRot = RHandAnimationRotationTotal/180 * Math.PI;

        SetPosition(rHandGoal, rHandVertexOffset, rHandVertexScale, new Float32Array([0,0,3]), rHandRot, new Float32Array([1,1,0]));
    }
    else if(AnimationType === "On/Off")
    {
        //Non inverse for walking actions
        RHandAnimationRotationTotal -= CurOnOffSpeed * OffReturnMultiplier / Math.PI * 180;

        if(RHandAnimationRotationTotal < -90) {
            RHandAnimationRotationTotal = -90;

        }
        else if(RHandAnimationRotationTotal > 0) {
            RHandAnimationRotationTotal = 0;

        }

        rHandRot = RHandAnimationRotationTotal/180 * Math.PI;

        SetPosition(rHandGoal, rHandVertexOffset, rHandVertexScale, new Float32Array([-rHandVertexOffset[0],-rHandVertexOffset[1] + 2, -rHandVertexOffset[2]]), rHandRot, new Float32Array([1,0,0]));
    }
    else
    {
        rHandRot = RHandAnimationRotationTotal/180 * Math.PI;
        SetPosition(rHandGoal, rHandVertexOffset, rHandVertexScale, new Float32Array([0,0,3]), rHandRot, new Float32Array([1,0,0]));
    }

    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(rHandGoal));

    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Left Leg =======================================
    var lLegVertexOffset = new Float32Array([3,1.5,6]);

    var lLegVertexScale = new Float32Array([2,1.5,4]);

    var lLegGoal = new Float32Array(16);

    var lLegRot;
    if(AnimationType === "LeftLeg")
    {
        //Inverse due to looking at -Y
        LLegAnimationRotationTotal -= MouseWheelInput / Math.PI * 180;

        if(LLegAnimationRotationTotal < -90) {
            LLegAnimationRotationTotal = -90;
        }
        else if(LLegAnimationRotationTotal > 0)
            LLegAnimationRotationTotal = 0;

        lLegRot = LLegAnimationRotationTotal/180 * Math.PI;
        SetPosition(lLegGoal, lLegVertexOffset, lLegVertexScale, new Float32Array([0,0,2.5]), lLegRot, new Float32Array([1,0,0]));
    }
    else if(AnimationType === "Walk")
    {
        LLegAnimationRotationTotal += WalkAnimSpeedLegs / Math.PI * 180;

        if(LLegAnimationRotationTotal < -90) {
            //Since the last part is animated flip the walking if this occurs
            LLegAnimationRotationTotal = -90;
        }
        else if(LLegAnimationRotationTotal > 0) {
            LLegAnimationRotationTotal = 0;
        }

        lLegRot = LLegAnimationRotationTotal/180 * Math.PI;
        SetPosition(lLegGoal, lLegVertexOffset, lLegVertexScale, new Float32Array([0,0,2.5]), lLegRot, new Float32Array([1,0,0]));

    }
    else if(AnimationType === "Dance") {
        DanceRandomLLegSpeed = (Math.random() * (0.1 * SpinLLegBackMultiplier) / (1));
        LLegAnimationRotationTotal -= DanceRandomLLegSpeed  / Math.PI * 180;

        if (LLegAnimationRotationTotal < -45) {
            LLegAnimationRotationTotal = -45;
            SpinLLegBackMultiplier *= -1;
        } else if(LLegAnimationRotationTotal > 0) {
            LLegAnimationRotationTotal = 0;
            SpinLLegBackMultiplier *= -1;
        }
        lLegRot = LLegAnimationRotationTotal/180 * Math.PI;
        SetPosition(lLegGoal, lLegVertexOffset, lLegVertexScale, new Float32Array([0,0,2.5]), lLegRot, new Float32Array([1,1,0]));
    }
    else if(AnimationType === "On/Off")
    {
        LLegAnimationRotationTotal -= CurOnOffSpeed * OffReturnMultiplier / Math.PI * 180;

        if(LLegAnimationRotationTotal < -90) {
            //Since the last part is animated flip the walking if this occurs
            LLegAnimationRotationTotal = -90;
        }
        else if(LLegAnimationRotationTotal > 0) {
            LLegAnimationRotationTotal = 0;
        }

        lLegRot = LLegAnimationRotationTotal/180 * Math.PI;
        SetPosition(lLegGoal, lLegVertexOffset, lLegVertexScale, new Float32Array([-lLegVertexOffset[0],-lLegVertexOffset[1] + 2, -lLegVertexOffset[2]]), lLegRot, new Float32Array([1,0,0]));
    }
    else
    {
        lLegRot = LLegAnimationRotationTotal/180 * Math.PI;
        SetPosition(lLegGoal, lLegVertexOffset, lLegVertexScale, new Float32Array([0,0,2.5]), lLegRot, new Float32Array([1,0,0]));
    }


    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(lLegGoal));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.activeTexture(GL.TEXTURE3);
    GL.bindTexture(GL.TEXTURE_2D, LegsTexture);
    GL.uniform1i(SamplerPointer, 3);
    GL.bindBuffer(GL.ARRAY_BUFFER, LegsCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, LegsCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Right Leg ==================================================
    var rLegVertexOffset = new Float32Array([-3,1.5,6]);

    var rLegVertexScale = new Float32Array([2,1.5,4]);

    var rLegGoal = new Float32Array(16);

    var rLegRot;
    if(AnimationType === "RightLeg")
    {
        //Inverse due to looking at -Y
        RLegAnimationRotationTotal -= MouseWheelInput / Math.PI * 180;

        if(RLegAnimationRotationTotal < -90) {
            RLegAnimationRotationTotal = -90;
        }
        else if(RLegAnimationRotationTotal > 0)
            RLegAnimationRotationTotal = 0;

        rLegRot = RLegAnimationRotationTotal/180 * Math.PI;
        SetPosition(rLegGoal, rLegVertexOffset, rLegVertexScale, new Float32Array([0,0,2.5]), rLegRot, new Float32Array([1,0,0]));
    }
    else if(AnimationType === "Walk")
    {
        RLegAnimationRotationTotal -= WalkAnimSpeedLegs / Math.PI * 180;

        if(RLegAnimationRotationTotal < -90) {
            //Since the last part is animated flip the walking if this occurs
            RLegAnimationRotationTotal = -90;
            WalkAnimSpeedLegs *= -1;
        }
        else if(RLegAnimationRotationTotal > 0) {
            RLegAnimationRotationTotal = 0;
            WalkAnimSpeedLegs *= -1;
        }

        rLegRot = RLegAnimationRotationTotal/180 * Math.PI;
        SetPosition(rLegGoal, rLegVertexOffset, rLegVertexScale, new Float32Array([0,0,2.5]), rLegRot, new Float32Array([1,0,0]));
    }
    else if(AnimationType === "Dance") {
        DanceRandomRLegSpeed = (Math.random() * (0.05 * SpinRLegBackMultiplier) / (1));
        RLegAnimationRotationTotal -= DanceRandomRLegSpeed  / Math.PI * 180;

        if (RLegAnimationRotationTotal < -90) {
            RLegAnimationRotationTotal = -90;
            SpinRLegBackMultiplier *= -1;
        } else if(RLegAnimationRotationTotal > 0) {
            RLegAnimationRotationTotal = 0;
            SpinRLegBackMultiplier *= -1;
        }

        rLegRot = RLegAnimationRotationTotal/180 * Math.PI;
        SetPosition(rLegGoal, rLegVertexOffset, rLegVertexScale, new Float32Array([0,0,2.5]), rLegRot, new Float32Array([1,-1,0]));
    }
    else if(AnimationType === "On/Off")
    {
        RLegAnimationRotationTotal -= CurOnOffSpeed * OffReturnMultiplier / Math.PI * 180;

        if(RLegAnimationRotationTotal < -90) {
            //Since the last part is animated flip the walking if this occurs
            RLegAnimationRotationTotal = -90;
        }
        else if(RLegAnimationRotationTotal > 0) {
            RLegAnimationRotationTotal = 0;
        }

        rLegRot = RLegAnimationRotationTotal/180 * Math.PI;
        //Offset 2 so we touch the heels
        SetPosition(rLegGoal, rLegVertexOffset, rLegVertexScale, new Float32Array([-rLegVertexOffset[0],-rLegVertexOffset[1] + 2,-rLegVertexOffset[2]]), rLegRot, new Float32Array([1,0,0]));
    }
    else
    {
        rLegRot = RLegAnimationRotationTotal/180 * Math.PI;
        SetPosition(rLegGoal, rLegVertexOffset, rLegVertexScale, new Float32Array([0,2,2.5]), rLegRot, new Float32Array([1,0,0]));
    }


    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(rLegGoal));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Left Foot
    var lFootVertexOffset = new Float32Array([3,0,1]);

    var lFootVertexScale = new Float32Array([2,3,1]);

    var lFootGoal = new Float32Array(16);

    var lFootRot = LLegAnimationRotationTotal/180 * Math.PI;

    if(AnimationType === "LeftLeg")
    {
        SetPosition(lFootGoal, lFootVertexOffset, lFootVertexScale, new Float32Array([0,1.5,7.5]), lFootRot, new Float32Array([1,0,0]));
    }
    else if(AnimationType === "Walk")
    {
        SetPosition(lFootGoal, lFootVertexOffset, lFootVertexScale, new Float32Array([0,1.5,7.5]), lFootRot, new Float32Array([1,0,0]));
    }
    else if(AnimationType === "Dance")
    {
        SetPosition(lFootGoal, lFootVertexOffset, lFootVertexScale, new Float32Array([0,1.5,7.5]), lFootRot, new Float32Array([1,1,0]));
    }
    else if(AnimationType === "On/Off")
    {
        SetPosition(lFootGoal, lFootVertexOffset, lFootVertexScale, new Float32Array([-lFootVertexOffset[0],-lFootVertexOffset[1] + 2, -lFootVertexOffset[2]]), lFootRot, new Float32Array([1,0,0]));
    }
    else
    {
        SetPosition(lFootGoal, lFootVertexOffset, lFootVertexScale, new Float32Array([0,1.5,7.5]), lFootRot, new Float32Array([1,0,0]));
    }




    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(lFootGoal));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.activeTexture(GL.TEXTURE4);
    GL.bindTexture(GL.TEXTURE_2D, FeetTexture);
    GL.uniform1i(SamplerPointer, 4);
    GL.bindBuffer(GL.ARRAY_BUFFER, FeetCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, FeetCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Right Foot
    var rFootVertexOffset = new Float32Array([-3,0,1]);
    var rFootVertexScale = new Float32Array([2,3,1]);

    var rFootGoal = new Float32Array(16);

    var rFootRot;

    rFootRot = RLegAnimationRotationTotal/180 * Math.PI;
    if(AnimationType === "RightLeg")
    {
        SetPosition(rFootGoal, rFootVertexOffset, rFootVertexScale, new Float32Array([0,1.5,7.5]), rFootRot, new Float32Array([1,0,0]));
    }
    else if(AnimationType === "Walk")
    {
        SetPosition(rFootGoal, rFootVertexOffset, rFootVertexScale, new Float32Array([0,1.5,7.5]), rFootRot, new Float32Array([1,0,0]));
    }
    else if(AnimationType === "Dance") {
        SetPosition(rFootGoal, rFootVertexOffset, rFootVertexScale, new Float32Array([0,1.5,7.5]), rFootRot, new Float32Array([1,-1,0]));
    }
    else if(AnimationType === "On/Off")
    {
        SetPosition(rFootGoal, rFootVertexOffset, rFootVertexScale, new Float32Array([-rFootVertexOffset[0], -rFootVertexOffset[1] + 2, -rFootVertexOffset[2]]), rFootRot, new Float32Array([1,0,0]));
    }
    else
    {
        SetPosition(rFootGoal, rFootVertexOffset, rFootVertexScale, new Float32Array([0,1.5,7.5]), rFootRot, new Float32Array([1,0,0]));
    }




    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(rFootGoal));

    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    AnimationRequestID = window.requestAnimationFrame(RenderScene);
}

function StartRendering()
{
    AnimationRequestID = window.requestAnimationFrame(RenderScene);
}

function StartSpinCamera()
{
    AnimateCamera = true;
}

function StopSpinCamera()
{
    AnimateCamera = false;
    WasAnimated = false;
}

function TextureLoader(imageURL, textureTarget)
{
    var imageObject = new Image();
    imageObject.onload = () => {
        GL.bindTexture(GL.TEXTURE_2D, textureTarget);
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, imageObject);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
        GL.generateMipmap(GL.TEXTURE_2D);
    }
    imageObject.src = imageURL;
}

function SetPosition(Result,Target, Scale, Pivot, Rotation, Axis)
{
    var origin = new Float32Array(16);
    var InversePivot = new Float32Array(16);
    var TargetMatrix = new Float32Array(16);

    //Move Item Down So we can get the actual rotation point
    glMatrix.mat4.fromTranslation(InversePivot, new Float32Array([-Pivot[0], -Pivot[1], -Pivot[2]]));

    glMatrix.mat4.fromScaling(ScaleMatrix, Scale);

    glMatrix.mat4.multiply(TranslateScaleMatrix, InversePivot, ScaleMatrix);


    glMatrix.mat4.fromRotation(RotationMatrix, Rotation, Axis);
    glMatrix.mat4.multiply(RotationTranslateScaleMatrix, RotationMatrix, TranslateScaleMatrix);


    //Return The Item Back To Origin
    glMatrix.mat4.fromTranslation(TranslateMatrix, new Float32Array(Pivot));
    glMatrix.mat4.multiply(origin, TranslateMatrix, RotationTranslateScaleMatrix);


    //Set to Goal
    glMatrix.mat4.fromTranslation(TargetMatrix, Target);
    glMatrix.mat4.multiply(Result, TargetMatrix, origin);
}

function ResetAnimation()
{
    HeadAnimationRotationTotal = 0;
    TorsoAnimationRotationTotal = 0;
    LHandAnimationRotationTotal = 0;
    RHandAnimationRotationTotal = 0;
    LLegAnimationRotationTotal = 0;
    RLegAnimationRotationTotal = 0;

    WalkAnimSpeedHead = 0.01;
    WalkAnimSpeedTorso = 0.005;
    WalkAnimSpeedHands = 0.02;
    WalkAnimSpeedLegs = 0.04;


    OffReturnMultiplier = 1;

    SpinHeadBackMultiplier = 1;
    SpinLLegBackMultiplier = 1;
    SpinRLegBackMultiplier = 1;
    SpinLHandBackMultiplier = 1;
    SpinRHandBackMultiplier = 1;

    DanceRandomHeadSpeed = 0;
    DanceRandomTorsoSpeed =0;
    DanceRandomLHandSpeed = 0;
    DanceRandomRHandSpeed = 0
    DanceRandomLLegSpeed = 0;
    DanceRandomRLegSpeed = 0;

    MouseWheelInput = 0;
}