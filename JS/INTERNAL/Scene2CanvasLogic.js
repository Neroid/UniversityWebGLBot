//Logic for the first scene by nektarios neroutsos.

//Canvas/Webgl Variables
var gl;
var canvas;
var shadersProgram;

//Cube Buffers
var headVerticesBuffer;
var headColorBuffer;
var headIndexBuffer;

var chestVerticesBuffer;
var chestColorBuffer;
var chestIndexBuffer;

var lArmVerticesBuffer;
var lArmColorBuffer;
var lArmIndexBuffer;

var rArmVerticesBuffer;
var rArmColorBuffer;
var rArmIndexBuffer;

var lLegVerticesBuffer;
var lLegColorBuffer;
var lLegIndexBuffer;

var rLegVerticesBuffer;
var rLegColorBuffer;
var rLegIndexBuffer;

var lFootVerticesBuffer;
var lFootColorBuffer;
var lFootIndexBuffer;

var rFootVerticesBuffer;
var rFootColorBuffer;
var rFootIndexBuffer;

//Camera Buffers
var vMatrix = new Float32Array(16);
var pMatrix = new Float32Array(16);
var pvMatrix = new Float32Array(16);

//Shaders Buffers
var vertexPositionAttributePointer;
var vertexColorAttributePointer;
var PerspectiveUniformPointer;

//Refreshing the window
var requestID = 0;

//HTML Vars
var viewAngle;
var viewDistance;
var cameraPosition;

function Main()
{
    Setup();
    ScaleCanvas();
    StartRendering();
    RenderScene();
}

//Rescale dynamically.
function ScaleCanvas()
{
    //Most aspect ratios tend to be more width heavy, we ofcourse check first which is the biggest ratio.
    var min = window.innerWidth >= window.innerHeight ?  0.8 * window.innerHeight : 0.8 * window.innerWidth;
    canvas.width = min;
    canvas.height = min;
    gl.clearColor(0.4, 0.4, 0.4, 1.0);
    gl.viewport(0,0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}

//General Variable Setup
function Setup()
{
    canvas = document.querySelector('#sceneCanvas');
    gl = WebGLDebugUtils.makeDebugContext(CreateWebGLContext(canvas));
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

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
    //============ Head
    var headVerticesBufferData = new Float32Array([
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

    var headColorBufferData = new Float32Array([
        //Front
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,

        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,
        //Right
        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,

        //Left
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,

        //Back
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,

        //Top
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,

        //Bottom
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
    ]);

    var headIndexBufferData = new Uint16Array([
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

    //Feed Data Into Respective Buffers
    headVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, headVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, headVerticesBufferData, gl.STATIC_DRAW);
    headVerticesBuffer.itemSize = 4;
    headVerticesBuffer.itemCount = 28;


    headColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, headColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, headColorBufferData, gl.STATIC_DRAW);
    headColorBuffer.itemSize = 4;
    headColorBuffer.itemCount = 28;


    headIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, headIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, headIndexBufferData, gl.STATIC_DRAW);
    headIndexBuffer.itemCount = 36;

    //============ Chest
    var chestVerticesBufferData = new Float32Array([
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

    var chestColorBufferData = new Float32Array([
        //Front
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,

        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,
        //Right
        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,

        //Left
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,

        //Back
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,

        //Top
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,

        //Bottom
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
    ]);

    var chestIndexBufferData = new Uint16Array([
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

    chestVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, chestVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, chestVerticesBufferData, gl.STATIC_DRAW);
    chestVerticesBuffer.itemSize = 4;
    chestVerticesBuffer.itemCount = 28;


    chestColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, chestColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, chestColorBufferData, gl.STATIC_DRAW);
    chestColorBuffer.itemSize = 4;
    chestColorBuffer.itemCount = 28;


    chestIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chestIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, chestIndexBufferData, gl.STATIC_DRAW);
    chestIndexBuffer.itemCount = 36;

    //============= Left Arm
    var lArmVerticesBufferData = new Float32Array([
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

    var lArmColorBufferData = new Float32Array([
        //Front
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,

        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,
        //Right
        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,

        //Left
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,

        //Back
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,

        //Top
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,

        //Bottom
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
    ]);

    var lArmIndexBufferData = new Uint16Array([
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

    lArmVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lArmVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lArmVerticesBufferData, gl.STATIC_DRAW);
    lArmVerticesBuffer.itemSize = 4;
    lArmVerticesBuffer.itemCount = 28;


    lArmColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lArmColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lArmColorBufferData, gl.STATIC_DRAW);
    lArmColorBuffer.itemSize = 4;
    lArmColorBuffer.itemCount = 28;


    lArmIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lArmIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lArmIndexBufferData, gl.STATIC_DRAW);
    lArmIndexBuffer.itemCount = 36;

    //============= Right Arm
    var rArmVerticesBufferData = new Float32Array([
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

    var rArmColorBufferData = new Float32Array([
        //Front
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,

        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,
        //Right
        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,

        //Left
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,

        //Back
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,

        //Top
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,

        //Bottom
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
    ]);

    var rArmIndexBufferData = new Uint16Array([
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

    rArmVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rArmVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rArmVerticesBufferData, gl.STATIC_DRAW);
    rArmVerticesBuffer.itemSize = 4;
    rArmVerticesBuffer.itemCount = 28;


    rArmColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rArmColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rArmColorBufferData, gl.STATIC_DRAW);
    rArmColorBuffer.itemSize = 4;
    rArmColorBuffer.itemCount = 28;


    rArmIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rArmIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rArmIndexBufferData, gl.STATIC_DRAW);
    rArmIndexBuffer.itemCount = 36;

    //============= Left Leg
    var lLegVerticesBufferData = new Float32Array([
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

    var lLegColorBufferData = new Float32Array([
        //Front
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,

        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,
        //Right
        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,

        //Left
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,

        //Back
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,

        //Top
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,

        //Bottom
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
    ]);

    var lLegIndexBufferData = new Uint16Array([
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

    lLegVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lLegVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lLegVerticesBufferData, gl.STATIC_DRAW);
    lLegVerticesBuffer.itemSize = 4;
    lLegVerticesBuffer.itemCount = 28;


    lLegColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lLegColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lLegColorBufferData, gl.STATIC_DRAW);
    lLegColorBuffer.itemSize = 4;
    lLegColorBuffer.itemCount = 28;


    lLegIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lLegIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lLegIndexBufferData, gl.STATIC_DRAW);
    lLegIndexBuffer.itemCount = 36;

    //============= Right Leg
    var rLegVerticesBufferData = new Float32Array([
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

    var rLegColorBufferData = new Float32Array([
        //Front
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,

        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,
        //Right
        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,

        //Left
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,

        //Back
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,

        //Top
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,

        //Bottom
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
    ]);

    var rLegIndexBufferData = new Uint16Array([
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

    rLegVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rLegVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rLegVerticesBufferData, gl.STATIC_DRAW);
    rLegVerticesBuffer.itemSize = 4;
    rLegVerticesBuffer.itemCount = 28;


    rLegColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rLegColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rLegColorBufferData, gl.STATIC_DRAW);
    rLegColorBuffer.itemSize = 4;
    rLegColorBuffer.itemCount = 28;


    rLegIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rLegIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rLegIndexBufferData, gl.STATIC_DRAW);
    rLegIndexBuffer.itemCount = 36;

    //============= Left Foot
    var lFootVerticesBufferData = new Float32Array([
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

    var lFootColorBufferData = new Float32Array([
        //Front
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,

        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,
        //Right
        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,

        //Left
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,

        //Back
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,

        //Top
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,

        //Bottom
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
    ]);

    var lFootIndexBufferData = new Uint16Array([
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

    lFootVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lFootVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lFootVerticesBufferData, gl.STATIC_DRAW);
    lFootVerticesBuffer.itemSize = 4;
    lFootVerticesBuffer.itemCount = 28;


    lFootColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lFootColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lFootColorBufferData, gl.STATIC_DRAW);
    lFootColorBuffer.itemSize = 4;
    lFootColorBuffer.itemCount = 28;


    lFootIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lFootIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lFootIndexBufferData, gl.STATIC_DRAW);
    lFootIndexBuffer.itemCount = 36;

    //============= Right Foot
    var rFootVerticesBufferData = new Float32Array([
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

    var rFootColorBufferData = new Float32Array([
        //Front
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,
        0.0, 0.85, 1.0, 1.0,

        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,
        //Right
        0.0, 0.70, 0.90, 1.0,
        0.0, 0.70, 0.90, 1.0,

        //Left
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,
        0.0, 0.60, 0.8, 1.0,

        //Back
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,
        0.0, 0.45, 0.75, 1.0,

        //Top
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,
        0.0, 0.6, 0.7, 1.0,

        //Bottom
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
        0.0, 0.2, 0.5, 1.0,
    ]);

    var rFootIndexBufferData = new Uint16Array([
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

    rFootVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rFootVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rFootVerticesBufferData, gl.STATIC_DRAW);
    rFootVerticesBuffer.itemSize = 4;
    rFootVerticesBuffer.itemCount = 28;


    rFootColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rFootColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rFootColorBufferData, gl.STATIC_DRAW);
    rFootColorBuffer.itemSize = 4;
    rFootColorBuffer.itemCount = 28;


    rFootIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rFootIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rFootIndexBufferData, gl.STATIC_DRAW);
    rFootIndexBuffer.itemCount = 36;
}

function SetupShaders()
{
    //Source codes for the shaders
    const vertexShaderSourceCode = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    
    uniform mat4 uPerspectiveMatrix;
    
    varying vec4 vVertexColor;
    
    void main()
    {
        gl_Position = uPerspectiveMatrix * aVertexPosition;
        vVertexColor = aVertexColor;
    }
    `;

    const fragmentShaderSourceCode = `
    precision mediump float; 
    
    varying vec4 vVertexColor;
    
    void main()
    {
        gl_FragColor = vVertexColor;
    }
    `;

    //Create buffers and compile the shader codes.
    var vertexCompiledShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexCompiledShader, vertexShaderSourceCode);
    gl.compileShader(vertexCompiledShader);

    if(! gl.getShaderParameter(vertexCompiledShader, gl.COMPILE_STATUS))
    {
        alert("Vertex Shader compilation error: " + gl.getShaderInfoLog(vertexCompiledShader));
        gl.deleteShader(vertexCompiledShader);
        vertexCompiledShader = null;
    }

    var fragmentCompiledShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentCompiledShader, fragmentShaderSourceCode);
    gl.compileShader(fragmentCompiledShader);

    if(! gl.getShaderParameter(fragmentCompiledShader, gl.COMPILE_STATUS))
    {
        alert("Fragment Shader compilation error: " + gl.getShaderInfoLog(fragmentCompiledShader));
        gl.deleteShader(fragmentCompiledShader);
        fragmentCompiledShader = null;
    }

    //Link The Shaders Together
    shadersProgram = gl.createProgram();
    gl.attachShader(shadersProgram, vertexCompiledShader);
    gl.attachShader(shadersProgram, fragmentCompiledShader);
    gl.linkProgram(shadersProgram);

    //Use said program
    gl.useProgram(shadersProgram);

    //Connect - Init Attributes & Uniforms
    vertexPositionAttributePointer = gl.getAttribLocation(shadersProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttributePointer);

    vertexColorAttributePointer = gl.getAttribLocation(shadersProgram, "aVertexColor");
    gl.enableVertexAttribArray(vertexColorAttributePointer);

    PerspectiveUniformPointer = gl.getUniformLocation(shadersProgram, "uPerspectiveMatrix");
}

function RenderScene()
{
    ScaleCanvas();
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, headVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttributePointer, headVerticesBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, headColorBuffer);
    gl.vertexAttribPointer(vertexColorAttributePointer, headColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    glMatrix.mat4.identity(pMatrix);
    glMatrix.mat4.identity(vMatrix);
    glMatrix.mat4.identity(pvMatrix);

    cameraPosition = document.querySelector('input[name="CameraPositions"]:checked').value;
    viewDistance = parseFloat(document.querySelector('#viewDistance').value);
    viewAngle = parseFloat(document.querySelector('#viewAngle').value);

    var cameraPositionVec = new Float32Array([0,0,0]);
    switch(cameraPosition)
    {
        case "LeftFrontTop":
            cameraPositionVec = new Float32Array([-viewDistance, -viewDistance, viewDistance]);
            break;
        case "LeftFrontBottom":
            cameraPositionVec = new Float32Array([-viewDistance, -viewDistance, -viewDistance]);
            break;
        case "LeftBackTop":
            cameraPositionVec = new Float32Array([-viewDistance, viewDistance, viewDistance]);
            break;
        case "LeftBackBottom":
            cameraPositionVec = new Float32Array([-viewDistance, viewDistance, -viewDistance]);
            break;
        case "RightFrontTop":
            cameraPositionVec = new Float32Array([viewDistance, -viewDistance, viewDistance]);
            break;
        case "RightFrontBottom":
            cameraPositionVec = new Float32Array([viewDistance, -viewDistance, -viewDistance]);
            break;
        case "RightBackTop":
            cameraPositionVec = new Float32Array([viewDistance, viewDistance, viewDistance]);
            break;
        case "RightBackBottom":
            cameraPositionVec = new Float32Array([viewDistance, viewDistance, -viewDistance]);
            break;
        default:
            cameraPositionVec = new Float32Array([1,1,1]);
            break;
    }

    cameraPositionVec[0] *= Math.cos(viewAngle * Math.PI/180.0);
    cameraPositionVec[0] *= Math.sin(viewAngle * Math.PI/180.0);
    glMatrix.mat4.lookAt(vMatrix, cameraPositionVec, [0,0,0], [0,0,1]);
    glMatrix.mat4.perspective(pMatrix, (Math.PI / 180) * 90, 1, 0.01, viewDistance * 10);
    glMatrix.mat4.multiply(pvMatrix, pMatrix, vMatrix);

    gl.uniformMatrix4fv(PerspectiveUniformPointer, false, new Float32Array(pvMatrix));

    gl.drawElements(gl.TRIANGLES, headIndexBuffer.itemCount, gl.UNSIGNED_SHORT, 0);

    requestID = window.requestAnimationFrame(RenderScene);
}

function StartRendering()
{
    requestID = window.requestAnimationFrame(RenderScene);
}
