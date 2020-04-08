import { uapi } from './comms';
import { GameState, SerializedGameState } from '../lambdas/game-state';
import { Player } from '../lambdas/player';
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
            const data = await uapi('game', 'PUT', gs,);
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

                //e.preventDefault();

                if (form.checkValidity() === false) {
                    console.log('Invalid form');

                    const d = $('#game-url');

                    d.html('Please provide all required fields.');

                    return;
                }

                this.start();
            });
        });
    }

    /**
     * Initialize the page.
     */
    init() {

        this.loadHomePage();

        let hash = window.location.hash;
        hash = hash.replace('#', '');

        let page = 'pages/home.html';
        switch (hash) {
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
        }

        $('#rules-link').on('click', () => {
            this.loadContent('pages/rules.html');
        });

        $('#architecture-link').on('click', () => {
            this.loadContent('pages/architecture.html');
        });

        $('#about-link').on('click', () => {
            this.loadContent('pages/about.html');
        });

        $('#home-link').on('click', () => {
            this.loadHomePage();
        });

    }
}

const index = new Index();
index.init();