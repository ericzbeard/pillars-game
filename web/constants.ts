/**
 * Constants used in the UI.
 */
export class PillarsConstants {
 // Base width and height. Position everything as if it's this
    // size and then scale it to the actual size.
    static readonly BW = 1920;
    static readonly BH = 1080;
    static readonly PROPORTION = PillarsConstants.BW / PillarsConstants.BH;
    static readonly MARKETX = 900;
    static readonly MARKETY = 275;
    static readonly INPLAYX = 10;
    static readonly INPLAYY = PillarsConstants.MARKETY;
    static readonly INPLAYW = 450;
    static readonly INPLAYH = 540;
    static readonly INPLAY_START_KEY = 'inplay_start';
    static readonly INPLAY_HOVER_KEY = 'inplay_hover';
    static readonly INPLAY_AREA_KEY = PillarsConstants.INPLAY_START_KEY + '_area'
    static readonly BIGCARDX = PillarsConstants.INPLAYX + PillarsConstants.INPLAYW + 15;
    static readonly BIGCARDY = PillarsConstants.MARKETY;
    static readonly MARKET_START_KEY = 'market_';
    static readonly MARKET_HOVER_KEY = 'market_hover';
    static readonly HAND_START_KEY = 'hand_';
    static readonly HAND_HOVER_KEY = 'hand_hover_';
    static readonly DISCARD_START_KEY = 'discard_';
    static readonly DISCARD_HOVER_KEY = 'discard_hover_';
    static readonly DISCARD_AREA_KEY = 'disc_area'; // Don't start with discard_
    static readonly HAND_X = 260;
    static readonly HAND_Y = PillarsConstants.BH - 250;
    static readonly DISCARD_X = 1000;
    static readonly DISCARD_Y = PillarsConstants.BH - 250;
    static readonly HAND_WIDTH = 700;
    static readonly CARD_WIDTH = 172;
    static readonly CARD_HEIGHT = 237;
    static readonly CARD_RADIUS = 15;
    static readonly CARD_IMAGE_SCALE = 0.25;
    static readonly PILLARX = PillarsConstants.BW - PillarsConstants.CARD_WIDTH - 10;
    static readonly PILLARY = 10;
    static readonly PILLAR_SCALE = 0.85;
    static readonly COLOR_WHITE = 'white';
    static readonly COLOR_BLACKISH = '#212121';
    static readonly COLOR_WHITEISH = '#FAFAFA';
    static readonly MODALX = 200;
    static readonly MODALY = 200;
    static readonly MODALW = PillarsConstants.BW - 400;
    static readonly MODALH = PillarsConstants.BH - 400;
    static readonly MODALR = 50;
    static readonly MODALZ = 900;
    static readonly MODAL_KEY = 'modal';
    static readonly MODAL_CLOSE_KEY = 'modal_close';
    static readonly MODAL_HREF_KEY = 'modal_href';
    static readonly MODAL_CARD_ACTION_SCALE = 1.5;
    static readonly TRIALX = PillarsConstants.BW/2 - PillarsConstants.CARD_WIDTH/2;
    static readonly TRIALY = PillarsConstants.MODALY + 200;
    static readonly TRIAL_START_KEY = 'trial_';
    static readonly TRIAL_HOVER_KEY = 'trial_hover_';
    static readonly TRIAL_OFFSET = 23;
    static readonly INFO_KEY = 'info';
    static readonly POPUP_SCALE = 2.28;
    static readonly DICEX = 1600;
    static readonly DICEY = 120;
    static readonly CHATX = 620;
    static readonly CHATY = 10;
    static readonly CHATW = 800;
    static readonly CHATH = 240;
    static readonly COMPETITIVE_RESEARCH_KEY = PillarsConstants.MODAL_KEY + '_cr';
    static readonly NUMERALS = ['I', 'II', 'III', 'IV', 'V'];
    static readonly SUMMARYX = 10;
    static readonly SUMMARYY = 10;
    static readonly SUMMARYW = 300;
    static readonly SUMMARYH = 120;
    static readonly MENUX = PillarsConstants.CHATX + PillarsConstants.CHATW + 10;
    static readonly MENUY = 10;
    static readonly MENUW = 200;
    static readonly MENUH = 120;
    static readonly MENU_BUTTON_W = 125;
    static readonly MENU_BUTTON_H = 30;
}