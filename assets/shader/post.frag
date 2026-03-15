#ifdef GL_ES
precision highp float;
#endif

varying vec2 v_texCoords;
uniform sampler2D u_texture;
varying vec4 v_color;

uniform float time;
uniform vec2 distortion_fac;
uniform vec2 scale_fac;
uniform float feather_fac;
uniform float noise_fac;
uniform float bloom_fac;
uniform float crt_intensity;
uniform float glitch_intensity;
uniform float scanlines;

uniform vec2 u_resolution;

#define BUFF 0.01
#define BLOOM_AMT 3

void main() {

    vec2 tc = v_texCoords;
    vec2 orig_tc = tc;

    // ---- recenter ----
    tc = tc * 2.0 - 1.0;
    tc *= scale_fac;

    // ---- bulge ----
    tc += (tc.yx * tc.yx) * tc * (distortion_fac - 1.0);

    // ---- feather mask ----
    float mask =
            (1.0 - smoothstep(1.0 - feather_fac, 1.0, abs(tc.x) - BUFF)) *
            (1.0 - smoothstep(1.0 - feather_fac, 1.0, abs(tc.y) - BUFF));

    tc = (tc + 1.0) * 0.5;

    // ---- glitch offsets ----
    float offset_l = 0.0;
    float offset_r = 0.0;

    if (glitch_intensity > 0.01) {
        float timefac = 3.0 * time;

        offset_l = 50.0 * (
                -3.5
                + sin(timefac * 0.512 + tc.y * 40.0)
                + sin(-timefac * 0.8233 + tc.y * 81.532)
                + sin(timefac * 0.333 + tc.y * 30.3)
                + sin(-timefac * 0.1112331 + tc.y * 13.0)
        );

        offset_r = -50.0 * (
                -3.5
                + sin(timefac * 0.6924 + tc.y * 29.0)
                + sin(-timefac * 0.9661 + tc.y * 41.532)
                + sin(timefac * 0.4423 + tc.y * 40.3)
                + sin(-timefac * 0.13321312 + tc.y * 11.0)
        );

        if (glitch_intensity > 1.0) {
            offset_l = 50.0 * (
                    -1.5
                    + sin(timefac * 0.512 + tc.y * 4.0)
                    + sin(-timefac * 0.8233 + tc.y * 1.532)
                    + sin(timefac * 0.333 + tc.y * 3.3)
                    + sin(-timefac * 0.1112331 + tc.y * 1.0)
            );

            offset_r = -50.0 * (
                    -1.5
                    + sin(timefac * 0.6924 + tc.y * 19.0)
                    + sin(-timefac * 0.9661 + tc.y * 21.532)
                    + sin(timefac * 0.4423 + tc.y * 20.3)
                    + sin(-timefac * 0.13321312 + tc.y * 5.0)
            );
        }

        tc.x += 0.001 * glitch_intensity *
                clamp(offset_l, clamp(offset_r, -1.0, 0.0), 1.0);
    }

    // ---- sample base ----
    vec4 crt_tex = texture2D(u_texture, tc);

    float artifact_amp =
            (abs(clamp(offset_l, clamp(offset_r, -1.0, 0.0), 1.0))
             * glitch_intensity > 0.9) ? 3.0 : 1.0;

    // ---- chromatic aberration ----
    float crt_adj = max(0.0, crt_intensity / (0.16 * 0.3)) * artifact_amp;

    if (crt_adj > 0.000001) {
        float dx = 0.0005 * (1.0 + 10.0 * (artifact_amp - 1.0))
                   * 1600.0 / u_resolution.x;

        crt_tex.r = mix(crt_tex.r,
                        texture2D(u_texture, tc + vec2(dx, 0.0)).r,
                        crt_adj);

        crt_tex.g = mix(crt_tex.g,
                        texture2D(u_texture, tc - vec2(dx, 0.0)).g,
                        crt_adj);
    }

    vec3 rgb = crt_tex.rgb * (1.0 - crt_intensity * artifact_amp);

    // ---- glitch color punch ----
    if (sin(time + tc.y * 200.0) > 0.85) {
        if (offset_l > 0.01 && offset_l < 0.99) rgb.r = rgb.g * 1.5;
        if (offset_r < -0.01 && offset_r > -0.99) rgb.g = rgb.r * 1.5;
    }

    // ---- scanlines ----
    vec3 scan =
            vec3(
                    clamp(-0.3 + 2.0 * sin(tc.y * scanlines - 0.785), -1.0, 2.0),
                    clamp(-0.3 + 2.0 * cos(tc.y * scanlines), -1.0, 2.0),
                    clamp(-0.3 + 2.0 * cos(tc.y * scanlines - 1.047), -1.0, 2.0)
            );

    rgb += crt_tex.rgb * scan * crt_intensity * artifact_amp;

    // ---- noise ----
    float x = (tc.x - mod(tc.x, 0.002))
              * (tc.y - mod(tc.y, 0.0013))
              * time * 1000.0;

    x = mod(x, 13.0) * mod(x, 123.0);
    float dxn = mod(x, 0.11) / 0.11;

    rgb = mix(rgb, vec3(dxn), clamp(noise_fac * artifact_amp, 0.0, 1.0));

    // ---- contrast ----
    rgb -= vec3(0.55 - 0.02 * (artifact_amp - 1.0 - crt_adj * bloom_fac * 0.7));
    rgb *= (1.14 + crt_adj * (0.012 - bloom_fac * 0.12));
    rgb += vec3(0.5);

    vec4 final_col = vec4(rgb, 1.0);

    // ---- bloom ----
    vec4 bloom_col = vec4(0.0);
    float bloom = 0.0;

    if (bloom_fac > 0.00001 && crt_intensity > 0.000001) {

        bloom = 0.03 * crt_adj;
        float dist = 0.0015 * float(BLOOM_AMT);
        float cutoff = 0.6;

        for (int i = -BLOOM_AMT; i <= BLOOM_AMT; i++) {
            for (int j = -BLOOM_AMT; j <= BLOOM_AMT; j++) {
                vec4 s = texture2D(
                        u_texture,
                        tc + dist * vec2(float(i), float(j)) / float(BLOOM_AMT)
                );

                s.rgb = max(s.rgb / (1.0 - cutoff) - vec3(cutoff), 0.0);
                bloom_col += min(min(s.r, s.g), s.b)
                             * (2.0 - abs(float(i + j)) / float(BLOOM_AMT * 2));
            }
        }

        bloom_col /= float(BLOOM_AMT * BLOOM_AMT);
    }

    gl_FragColor = (final_col * (1.0 - bloom) + bloom * bloom_col) * mask * v_color;
}
