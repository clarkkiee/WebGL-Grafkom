function main() {
    var canvas = document.getElementById("myCanvas");
    var gl = canvas.getContext("webgl");

    // Vertex buffer
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Color buffer
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Normal buffer
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeNormals), gl.STATIC_DRAW);

    // Index buffer
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Compile vertex shader
    var vertexShaderCode = document.getElementById("vertexShaderCode").text;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    // Compile fragment shader with lighting code
    var fragmentShaderCode = `
        precision mediump float;
        varying vec3 v_Position;
        varying vec3 v_Color;
        varying vec3 v_Normal;
        uniform vec3 u_AmbientColor;
        uniform vec3 u_DiffuseColor;
        uniform vec3 u_DiffusePosition;
        void main() {
            vec3 lightDir = normalize(u_DiffusePosition - v_Position);
            float diffuseFactor = max(dot(v_Normal, lightDir), 0.1);
            vec3 diffuse = u_DiffuseColor * v_Color * diffuseFactor;
            vec3 ambient = u_AmbientColor * v_Color;
            gl_FragColor = vec4(ambient + diffuse, 1.0);
        }
    `;
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);

    // Link shaders into a program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Set up attributes and uniforms
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var aPosition = gl.getAttribLocation(shaderProgram, "a_Position");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var aColor = gl.getAttribLocation(shaderProgram, "a_Color");
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    var aNormal = gl.getAttribLocation(shaderProgram, "a_Normal");
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    // Uniform locations for transformation matrices and lighting
    var uModel = gl.getUniformLocation(shaderProgram, "u_Model");
    var uView = gl.getUniformLocation(shaderProgram, "u_View");
    var uProjection = gl.getUniformLocation(shaderProgram, "u_Projection");
    var uNormalMatrix = gl.getUniformLocation(shaderProgram, "u_NormalMatrix");
    var uAmbientColor = gl.getUniformLocation(shaderProgram, "u_AmbientColor");
    var uDiffuseColor = gl.getUniformLocation(shaderProgram, "u_DiffuseColor");
    var uDiffusePosition = gl.getUniformLocation(shaderProgram, "u_DiffusePosition");

    // Set light color and position
    gl.uniform3fv(uAmbientColor, [0.5, 0.5, 0.5]);
    gl.uniform3fv(uDiffuseColor, [0.8, 0.8, 0.8]);
    gl.uniform3fv(uDiffusePosition, [1.0, 1.0, -1.0]);
    
    // Set up matrices
    var model = glMatrix.mat4.create();
    var view = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(view, [0.0, 0.0, 3.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    var projection = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projection, glMatrix.glMatrix.toRadian(90), canvas.width / canvas.height, 0.5, 10.0);

    // Rotation angle
    var theta = glMatrix.glMatrix.toRadian(0.5);

    function render() {
        // Update model rotation
        if(!freeze){
            glMatrix.mat4.rotate(model, model, theta, [1.0, 1.0, 1.0]);
        }

        // Calculate normal matrix for lighting
        var normalMatrix = glMatrix.mat3.create();
        glMatrix.mat3.normalFromMat4(normalMatrix, model);

        // Pass matrices to shader
        gl.uniformMatrix4fv(uModel, false, model);
        gl.uniformMatrix4fv(uView, false, view);
        gl.uniformMatrix4fv(uProjection, false, projection);
        gl.uniformMatrix3fv(uNormalMatrix, false, normalMatrix);

        // Clear and draw
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(render);
    }

    render();
}
