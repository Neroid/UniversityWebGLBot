//Logic for the first scene by nektarios neroutsos.

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

var CubeIndexBuffer;


//Camera Buffers
var ViewMatrix = new Float32Array(16);
var PerspectiveMatrix = new Float32Array(16);
var PerspectiveViewMatrix = new Float32Array(16);

//Camera Vars
var TotalCameraAngle = 0;
var AnimateCamera = false;

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

//Support vars
var TranslateMatrix = new Float32Array(16);
var ScaleMatrix = new Float32Array(16);
var ScaleTranslateMatrix = new Float32Array(16);

//Refreshing the window
var AnimationRequestID = 0;

//HTML Vars
var ViewAngle;
var RotationStep;
var ViewDistance;
var CameraPosition

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

    HeadCoordsTextureBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, HeadCoordsTextureBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, headTextureCoordinates, GL.STATIC_DRAW);
    HeadCoordsTextureBuffer.itemSize = 2;
    HeadCoordsTextureBuffer.itemCount = 24;

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

    HeadTexture = GL.createTexture();
    var headImgURL = "../../Images/UVS/Head.png";
    TextureLoader(headImgURL, HeadTexture);

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
        gl_Position = uPerspectiveMatrix * uTranslateMatrix * aVertexPosition;
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
    //Adjust canvas to current resolution
    ScaleCanvas();

    //Camera Logic
    glMatrix.mat4.identity(PerspectiveMatrix);
    glMatrix.mat4.identity(ViewMatrix);
    glMatrix.mat4.identity(PerspectiveViewMatrix);

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
        TotalCameraAngle += RotationStep;
    }
    else
    {
        TotalCameraAngle = ViewAngle;
    }

    cameraPositionVec[0] *= Math.cos(TotalCameraAngle * Math.PI/180.0);
    cameraPositionVec[1] *= Math.sin(TotalCameraAngle * Math.PI/180.0);

    glMatrix.mat4.lookAt(ViewMatrix, cameraPositionVec, [0,0,0], [0,0,1]);
    glMatrix.mat4.perspective(PerspectiveMatrix, (Math.PI / 180) * 90, 1, 0.01, ViewDistance * 10);
    glMatrix.mat4.multiply(PerspectiveViewMatrix, PerspectiveMatrix, ViewMatrix);

    GL.uniformMatrix4fv(PerspectiveUniformPointer, false, new Float32Array(PerspectiveViewMatrix));

    //Head
    var headVertexOffset = new Float32Array([0,1,24.5]);
    glMatrix.mat4.identity(TranslateMatrix);
    glMatrix.mat4.fromTranslation(TranslateMatrix, headVertexOffset);

    var headVertexScale = new Float32Array([3,2,2.5]);
    glMatrix.mat4.identity(ScaleMatrix);
    glMatrix.mat4.fromScaling(ScaleMatrix, headVertexScale);


    glMatrix.mat4.identity(ScaleTranslateMatrix);
    glMatrix.mat4.multiply(ScaleTranslateMatrix, TranslateMatrix, ScaleMatrix);

    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(ScaleTranslateMatrix));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);


    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D, HeadTexture);
    GL.uniform1i(SamplerPointer, 0);
    GL.bindBuffer(GL.ARRAY_BUFFER, HeadCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, HeadCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);


    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Torso
    var torsoVertexOffset = new Float32Array([0,0,16]);
    glMatrix.mat4.identity(TranslateMatrix);
    glMatrix.mat4.fromTranslation(TranslateMatrix, torsoVertexOffset);

    var torsoVertexScale = new Float32Array([5,3,6]);
    glMatrix.mat4.identity(ScaleMatrix);
    glMatrix.mat4.fromScaling(ScaleMatrix, torsoVertexScale);


    glMatrix.mat4.multiply(ScaleTranslateMatrix, TranslateMatrix, ScaleMatrix);

    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(ScaleTranslateMatrix));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.activeTexture(GL.TEXTURE1);
    GL.bindTexture(GL.TEXTURE_2D, ChestTexture);
    GL.uniform1i(SamplerPointer, 1);
    GL.bindBuffer(GL.ARRAY_BUFFER, ChestCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, ChestCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Left Hand
    var lHandVertexOffset = new Float32Array([-6,0,17]);
    glMatrix.mat4.identity(TranslateMatrix);
    glMatrix.mat4.fromTranslation(TranslateMatrix, lHandVertexOffset);

    var lHandVertexScale = new Float32Array([1,2,5]);
    glMatrix.mat4.identity(ScaleMatrix);
    glMatrix.mat4.fromScaling(ScaleMatrix, lHandVertexScale);


    glMatrix.mat4.multiply(ScaleTranslateMatrix, TranslateMatrix, ScaleMatrix);

    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(ScaleTranslateMatrix));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.activeTexture(GL.TEXTURE2);
    GL.bindTexture(GL.TEXTURE_2D, HandsTexture);
    GL.uniform1i(SamplerPointer, 2);
    GL.bindBuffer(GL.ARRAY_BUFFER, HandsCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, HandsCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Right Hand
    var rHandVertexOffset = new Float32Array([6,0,17]);
    glMatrix.mat4.identity(TranslateMatrix);
    glMatrix.mat4.fromTranslation(TranslateMatrix, rHandVertexOffset);

    var rHandVertexScale = new Float32Array([1,2,5]);
    glMatrix.mat4.identity(ScaleMatrix);
    glMatrix.mat4.fromScaling(ScaleMatrix, rHandVertexScale);


    glMatrix.mat4.multiply(ScaleTranslateMatrix, TranslateMatrix, ScaleMatrix);

    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(ScaleTranslateMatrix));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Left Leg
    var rLegVertexOffset = new Float32Array([3,1.5,6]);
    glMatrix.mat4.identity(TranslateMatrix);
    glMatrix.mat4.fromTranslation(TranslateMatrix, rLegVertexOffset);

    var rLegVertexScale = new Float32Array([2,1.5,4]);
    glMatrix.mat4.identity(ScaleMatrix);
    glMatrix.mat4.fromScaling(ScaleMatrix, rLegVertexScale);


    glMatrix.mat4.multiply(ScaleTranslateMatrix, TranslateMatrix, ScaleMatrix);

    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(ScaleTranslateMatrix));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.activeTexture(GL.TEXTURE3);
    GL.bindTexture(GL.TEXTURE_2D, LegsTexture);
    GL.uniform1i(SamplerPointer, 3);
    GL.bindBuffer(GL.ARRAY_BUFFER, LegsCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, LegsCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Right Leg
    var lLegVertexOffset = new Float32Array([-3,1.5,6]);
    glMatrix.mat4.identity(TranslateMatrix);
    glMatrix.mat4.fromTranslation(TranslateMatrix, lLegVertexOffset);

    var lLegVertexScale = new Float32Array([2,1.5,4]);
    glMatrix.mat4.identity(ScaleMatrix);
    glMatrix.mat4.fromScaling(ScaleMatrix, lLegVertexScale);


    glMatrix.mat4.multiply(ScaleTranslateMatrix, TranslateMatrix, ScaleMatrix);

    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(ScaleTranslateMatrix));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Left Foot
    var lFootVertexOffset = new Float32Array([-3,0,1]);
    glMatrix.mat4.identity(TranslateMatrix);
    glMatrix.mat4.fromTranslation(TranslateMatrix, lFootVertexOffset);

    var lFootVertexScale = new Float32Array([2,3,1]);
    glMatrix.mat4.identity(ScaleMatrix);
    glMatrix.mat4.fromScaling(ScaleMatrix, lFootVertexScale);


    glMatrix.mat4.multiply(ScaleTranslateMatrix, TranslateMatrix, ScaleMatrix);

    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(ScaleTranslateMatrix));


    GL.bindBuffer(GL.ARRAY_BUFFER, CubeVerticesBuffer);
    GL.vertexAttribPointer(VertexPositionAttributePointer, CubeVerticesBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.activeTexture(GL.TEXTURE4);
    GL.bindTexture(GL.TEXTURE_2D, FeetTexture);
    GL.uniform1i(SamplerPointer, 4);
    GL.bindBuffer(GL.ARRAY_BUFFER, FeetCoordsTextureBuffer);
    GL.vertexAttribPointer(TextureCoordsAttributePointer, FeetCoordsTextureBuffer.itemSize, GL.FLOAT, false, 0, 0);

    GL.drawElements(GL.TRIANGLES, CubeIndexBuffer.itemCount, GL.UNSIGNED_SHORT, 0);

    //Right Foot
    var rFootVertexOffset = new Float32Array([3,0,1]);
    glMatrix.mat4.identity(TranslateMatrix);
    glMatrix.mat4.fromTranslation(TranslateMatrix, rFootVertexOffset);

    var rFootVertexScale = new Float32Array([2,3,1]);
    glMatrix.mat4.identity(ScaleMatrix);
    glMatrix.mat4.fromScaling(ScaleMatrix, rFootVertexScale);


    glMatrix.mat4.multiply(ScaleTranslateMatrix, TranslateMatrix, ScaleMatrix);

    GL.uniformMatrix4fv(TranslateUniformPointer, false, new Float32Array(ScaleTranslateMatrix));

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
