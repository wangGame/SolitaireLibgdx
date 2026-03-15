package com.tony.balatro.screen;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.files.FileHandle;
import com.badlogic.gdx.scenes.scene2d.actions.Actions;
import com.badlogic.gdx.scenes.scene2d.ui.Image;
import com.badlogic.gdx.utils.Align;
import com.kw.gdx.BaseGame;
import com.kw.gdx.asset.Asset;
import com.kw.gdx.utils.log.NLog;
import com.tony.balatro.migration.LuaProjectMirror;
import com.tony.balatro.migration.LuaProjectSummary;
import com.tony.balatro.bg.BgManager;
import com.tony.balatro.shader.ShaderType;
import com.tony.balatro.shader.ShaderUtils;
import com.wk.postProcessor.PostProcessorScreen;

public class LoadingScreen extends PostProcessorScreen {
    public LoadingScreen(BaseGame game){
        super(game, ShaderUtils.getShaderProgram(ShaderType.post));
        userCrt = false;
    }

    @Override
    public void initView() {
        super.initView();
        BgManager.getBgManager().showBg(stage);
        FileHandle textureDir = Gdx.files.internal("texture");
        for (FileHandle fileHandle : textureDir.list()) {
            if (fileHandle.name().endsWith(".png")) {
                Asset.getAsset().loadTexture("texture/"+fileHandle.name());
            }
        }
        LuaProjectSummary summary = LuaProjectMirror.getSummary();
        NLog.i(summary.toStatusLine());
        NLog.i(summary.toEntryLine());
    }

    @Override
    public void render(float delta) {
        super.render(delta);
        if (Asset.getAsset().update()) {
            setScreen(MainScreen.class);
        }
    }
}
