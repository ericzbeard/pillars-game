/**
 * Constants used in the UI.
 */
export class PillarsConstants {
 // Base width and height. Position everything as if it's this
    // size and then scale it to the actual size.
    static readonly BW = 1920;
    static readonly BH = 1080;
    static readonly PROPORTION = PillarsConstants.BW / PillarsConstants.BH;
    static readonly MARKETX = 850;
    static readonly MARKETY = 275;
    static readonly INPLAYX = 10;
    static readonly INPLAYY = PillarsConstants.MARKETY;
    static readonly INPLAYW = 450;
    static readonly INPLAYH = 540;
    static readonly INPLAY_START_KEY = 'inplay_start';
    static readonly INPLAY_HOVER_KEY = 'inplay_hover';
    static readonly BIGCARDX = 480;
    static readonly BIGCARDY = PillarsConstants.MARKETY + 15;
    static readonly MARKET_START_KEY = 'market_';
    static readonly MARKET_HOVER_KEY = 'market_hover';
    static readonly HAND_START_KEY = 'hand_';
    static readonly HAND_HOVER_KEY = 'hand_hover_';
    static readonly DISCARD_START_KEY = 'discard_';
    static readonly DISCARD_HOVER_KEY = 'discard_hover_';
    static readonly HAND_X = 280;
    static readonly HAND_Y = PillarsConstants.BH - 250;
    static readonly DISCARD_X = 1000;
    static readonly DISCARD_Y = PillarsConstants.BH - 250;
    static readonly HAND_WIDTH = 600;
    static readonly PILLARX = 650;
    static readonly PILLARY = 10;
    static readonly PILLARW = 195;
    static readonly COLOR_WHITE = 'white';
    static readonly COLOR_BLACKISH = '#212121';
    static readonly COLOR_WHITEISH = '#FAFAFA';
    static readonly TRIALX = PillarsConstants.BW - 210;
    static readonly TRIALY = 50;
    static readonly TRIAL_START_KEY = 'trial_';
    static readonly TRIAL_HOVER_KEY = 'trial_hover_';
    static readonly TRIALY_OFFSET = 23;
    static readonly MODALX = 200;
    static readonly MODALY = 200;
    static readonly MODALW = PillarsConstants.BW - 400;;
    static readonly MODALH = PillarsConstants.BH - 400;
    static readonly MODALR = 50;
    static readonly MODAL_KEY = 'modal';
    static readonly MODAL_CLOSE_KEY = 'modal_close';
    static readonly MODAL_HREF_KEY = 'modal_href';
    static readonly INFO_KEY = 'info';
}