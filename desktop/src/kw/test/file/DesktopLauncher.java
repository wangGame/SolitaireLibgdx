package kw.test.file;

import com.badlogic.gdx.Game;
import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.backends.lwjgl.LwjglApplication;
import com.badlogic.gdx.backends.lwjgl.LwjglApplicationConfiguration;
import com.badlogic.gdx.files.FileHandle;
import com.solvitaire.gdx.FreeCellGame;

public class DesktopLauncher {
    public static void main(String[] args) {
        ReadFileConfig readFileConfig = new ReadFileConfig();
        Bean value = readFileConfig.getValue();
        LwjglApplicationConfiguration config = new LwjglApplicationConfiguration();
        config.title = value.getName();
        config.x = 1000;
        config.y = 0;
        config.height = (int)(720);
        config.width = (int) (1280);
        config.stencil = 8;
        new LwjglApplication(new FreeCellGame(),config);
//        new LwjglApplication(new Game() {
//            @Override
//            public void create() {
//                String path = "BlindChips";
//                int cols = 21;
//                int row = 31;
//                FileHandle internal = Gdx.files.internal("texture/"+path+".png");
//                PixmapSplitUtil.splitAndSave(internal,Gdx.files.local(path),cols,row,path);
//            }
//        });
    }
}
