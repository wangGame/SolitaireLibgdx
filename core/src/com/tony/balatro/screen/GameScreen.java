package com.tony.balatro.screen;

import com.badlogic.gdx.utils.Align;
import com.kw.gdx.BaseGame;
import com.kw.gdx.resource.annotation.ScreenResource;
import com.kw.gdx.screen.BaseScreen;
import com.tony.balatro.bg.BgManager;
import com.tony.balatro.view.IconCardGroup;

@ScreenResource("cocos/GameScene.json")
public class GameScreen extends BaseScreen {
    public GameScreen(BaseGame game) {
        super(game);
    }

    @Override
    public void initView() {
        super.initView();
        BgManager.getBgManager().showBg(stage);
    }
}
