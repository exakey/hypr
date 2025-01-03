precision mediump float;

uniform sampler2D u_Texture; // The input texture (scene or image)
uniform float u_BloomThreshold; // Threshold to isolate bright areas
uniform float u_BloomIntensity; // Intensity of the bloom effect
uniform vec2 u_Resolution; // Resolution of the output screen

varying vec2 v_TexCoord; // Texture coordinates from the vertex shader

// Function to apply a simple blur on the texture (assuming a 3x3 kernel for simplicity)
vec4 blur(vec2 texCoord, sampler2D texture, vec2 resolution) {
    float offset = 1.0 / resolution.x; // Offset per pixel
    vec4 color = vec4(0.0);

    // Simple 3x3 kernel blur
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 offsetCoord = texCoord + vec2(x, y) * offset;
            color += texture2D(texture, offsetCoord);
        }
    }

    return color / 9.0; // Average the colors
}

void main() {
    vec4 color = texture2D(u_Texture, v_TexCoord);

    // Debug: Check if texture sample is valid
    if (color.r == 0.0 && color.g == 0.0 && color.b == 0.0) {
        color = vec4(1.0, 0.0, 0.0, 1.0); // Display red if texture is empty
    }

    // Apply bloom effect: isolate bright areas based on the threshold
    if (color.r > u_BloomThreshold || color.g > u_BloomThreshold || color.b > u_BloomThreshold) {
        color *= u_BloomIntensity; // Intensify the bloom
    } else {
        color = vec4(0.0); // Black out areas below the threshold
    }

    // Apply a blur to the bright areas to simulate bloom effect
    vec4 blurredColor = blur(v_TexCoord, u_Texture, u_Resolution);

    // Combine the bloom effect with the original scene color
    gl_FragColor = color + blurredColor;

    // Optional: Clamp the final color to avoid overflow
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
}
