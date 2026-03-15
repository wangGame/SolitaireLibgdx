#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_color;
varying vec2 v_texCoords;

uniform sampler2D u_texture;

uniform float time;
uniform float vort_speed;
uniform vec4 colour_1;
uniform vec4 colour_2;
uniform float mid_flash;
uniform float vort_offset;

#define PIXEL_SIZE_FAC 700.0
#define BLACK vec4(79.0/255.0*0.6, 99.0/255.0*0.6, 103.0/255.0*0.6, 1.0)

void main() {

    // === UV（随 Sprite 移动缩放）===
    vec2 uv = v_texCoords * 2.0 - 1.0;
    float uv_len = length(uv);

    // Pixelation
    float pixel_size = 1.0 / PIXEL_SIZE_FAC;
    uv = floor(uv / pixel_size) * pixel_size;

    // === 漩涡 ===
    float speed = time * vort_speed;

    float new_pixel_angle =
            atan(uv.y, uv.x)
            + (2.2 + 0.4 * min(6.0, speed)) * uv_len
            - 1.0
            - speed * 0.05
            - min(6.0, speed) * speed * 0.02
            + vort_offset;

    vec2 sv = vec2(
            uv_len * cos(new_pixel_angle),
            uv_len * sin(new_pixel_angle)
    );

    sv *= 30.0;
    speed = time * 6.0 * vort_speed + vort_offset + 1033.0;

    vec2 uv2 = vec2(sv.x + sv.y);

    for (int i = 0; i < 5; i++) {
        uv2 += sin(max(sv.x, sv.y)) + sv;
        sv += 0.5 * vec2(
                cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
                sin(uv2.x - 0.113 * speed)
        );
        sv -= vec2(
                cos(sv.x + sv.y),
                sin(sv.x * 0.711 - sv.y)
        );
    }

    float smoke_res =
            min(2.0, max(-2.0,
                         1.5 + length(sv) * 0.12
                         - 0.17 * (min(10.0, time * 1.2 - 4.0))
            ));

    if (smoke_res < 0.2) {
        smoke_res = (smoke_res - 0.2) * 0.6 + 0.2;
    }

    float c1p = max(0.0, 1.0 - 2.0 * abs(1.0 - smoke_res));
    float c2p = max(0.0, 1.0 - 2.0 * smoke_res);
    float cb  = 1.0 - min(1.0, c1p + c2p);

    vec4 ret_col =
            colour_1 * c1p +
            colour_2 * c2p +
            vec4(cb * BLACK.rgb, cb * colour_1.a);

    float mod_flash =
            max(mid_flash * 0.8,
                max(c1p, c2p) * 5.0 - 4.4
            )
            + mid_flash * max(c1p, c2p);

    vec4 final_col =
            ret_col * (1.0 - mod_flash)
            + mod_flash * vec4(1.0);

    // === 纹理 + 颜色 ===
    vec4 tex = texture2D(u_texture, v_texCoords);

    gl_FragColor = final_col * v_color;
}
