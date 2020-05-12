import { uapi } from './comms';
import { GameState, SerializedGameState } from '../lambdas/game-state';
import * as Cookies from 'js-cookie';

export class Index {

    /**
     * Load a content page and insert it into the dom.
     */
    loadContent(path: string, callback?: Function) {
        $.ajax(path, {
            method: 'get',
            success: (content) => {
                $('#content').html(content);
                callback?.();
            }
        });
    };

    /**
     * Start a game by sending it to the server and getting a unique id.
     */
    async put(gameState: GameState, callback: Function) {

        const gs = JSON.stringify(new SerializedGameState(gameState));

        try {
            // Send the game to the server
            const data = await uapi('game', 'PUT', gs);
            console.log(data);
            const rgs = GameState.RehydrateGameState(<SerializedGameState>data);
            callback(rgs.id);
        } catch (ex) {
            console.log(ex);
        }
    }

    /**
     * Start a new game.
     */
    start() {
        const soloMulti = $('input[name=soloRadio]:checked', '#start-form').val();
        const numPlayers = $('input[name=playersRadio]:checked', '#start-form').val();
        const pillarMax = $('input[name=pillarsRadio]:checked', '#start-form').val();
        const name = $('#txt-your-name').val();

        console.log(`soloMulti: ${soloMulti}`);
        console.log(`numPlayers: ${numPlayers}`);
        console.log(`pillarMax: ${pillarMax}`);
        console.log(`name: ${name}`);

        const isSolo = soloMulti == 'solo';

        const gameState = new GameState();
        gameState.start(<number>numPlayers, <number>pillarMax, <string>name, isSolo);

        const d = $('#game-url');

        d.html('Please wait...');
        this.put(gameState, (id: string) => {
            let url = `\"play.html#${id}\"`;

            // Set a cookie so we know which player this is later
            Cookies.set(id + '-name', <string>name);

            let msg = `Redirecting to: <a href=${url}>${url}</a>`;
            if (!isSolo) {
                msg += '<br/>(Share this link with other players)';
            }
            d.html(msg);

            window.location.href = `play.html#${id}`;
        });

    }

    /**
     * Load the home page and wire up buttons.
     */
    loadHomePage() {
        this.loadContent('pages/home.html', () => {

            const form = <HTMLFormElement>document.getElementById("start-form");
            form.addEventListener('submit', (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                form.classList.add('was-validated');
            });

            $('#btn-start').on('click', (e) => {

                if (form.checkValidity() === false) {
                    console.log('Invalid form');

                    const d = $('#game-url');

                    d.html('Please provide all required fields.');

                    return;
                }

                this.start();
            });

            $('#btn-tutorial').on('click', (e) => {
                window.location.href = 'play.html';
            });
        });
    }

    /**
     * Link to a page in response to a click.
     */
    linkTo(e: Event, page: string, callback: Function) {

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const loc = page;
        history.pushState(loc, '', "#" + loc);
        window.location.hash = loc;

        console.log(`Pushed ${loc} to history`);

        callback();
    }

    /**
     * Load a page by name.
     */
    loadPage(name:string) {
        let page = 'pages/home.html';
        switch (name) {
            case 'rules':
                page = 'pages/rules.html';
                break;
            case 'architecture':
                page = 'pages/architecture.html';
                break;
            case 'about':
                page = 'pages/about.html';
                break;
            default:
                break;
        }

        if (page === 'pages/home.html') {
            this.loadHomePage();
        } else {
            this.loadContent(page);
        }
    }

    /**
     * Check the hash in the URL
     */
    checkHash() {
        let hash = window.location.hash;
        hash = hash.replace('#', '');
        this.loadPage(hash);
    }

    /**
     * Handle the window popstate event (back button, etc)
     */
    popstate(e: any) { //PopStateEvent

        const self = this;

        console.info(e.originalEvent);

        const state = e.originalEvent.state;

        console.log('popstate ' + state);

        if (state) {
            this.loadPage(state);
        } else {
            // Look at the hash. This happens if you manually edit the URL

            console.log('popstate checking hash');

            self.checkHash.call(self);
        }
    }


    /**
     * Initialize the page.
     */
    init() {

        const self = this;

        // Handle history events like the back button
        $(window).off('popstate').on('popstate', (e:any) => {
             self.popstate.call(self, e) 
        });

        // Wire up links
        $('#rules-link').on('click', (e: Event) => {
            this.linkTo(e, 'rules', () => {
                this.loadContent('pages/rules.html');
            });
        });

        $('#architecture-link').on('click', (e: Event) => {
            this.linkTo(e, 'architecture', () => {
                this.loadContent('pages/architecture.html');
            });
        });

        $('#about-link').on('click', (e: Event) => {
            this.linkTo(e, 'about', () => {
                this.loadContent('pages/about.html');
            });
        });

        $('#home-link').on('click', (e: Event) => {
            this.linkTo(e, 'home', () => {
                this.loadHomePage();
            });
        });

        // See what page we need to load
        this.checkHash();
    }
}

const index = new Index();
index.init();