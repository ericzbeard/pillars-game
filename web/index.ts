import { uapi } from './comms';
import { GameState, SerializedGameState } from '../lambdas/game-state';
import { Player } from '../lambdas/player';

export class Index {

    /**
     * Load a content page and insert it into the dom.
     */
    loadContent(path:string, callback?:Function) {
        $.ajax(path, {
            method: 'get', 
            success: (content) => {
                $('#content').html(content);
                callback?.();
            }
        });
    };

    /**
     * Start a multi-player game.
     */
    startMulti(callback:Function) {
        const gameState = new GameState();

        // Players
        const numPlayers = <number>$('input[name=playersRadio]:checked', '#multi-form').val();
        for (let i = 0; i < numPlayers; i++) {
            const player = new Player();
            if (i == 0) {
                player.name = <string>$('#txt-your-name').val();
            }
            // Empty name indicates an open slot for others to join
            player.isHuman = true;
            player.index = i;
            gameState.players.push(player);
        }
        gameState.pillarMax = <number>$('input[name=pillarsRadio]:checked', '#multi-form').val();

        const gs = JSON.stringify(new SerializedGameState(gameState));

        // Send the game to the server
        uapi('game', 'PUT', gs, (data:SerializedGameState) => {
            console.log(data);
            const rgs = GameState.RehydrateGameState(data);

            callback(rgs.id);

        }, (error:string) => {
            console.log(error);
        });
    }

    /**
     * Load the home page and wire up buttons.
     */
    loadHomePage() {
        
        this.loadContent('pages/home.html', () => {

            const form = <HTMLFormElement>document.getElementById("multi-form");
            form.addEventListener('submit', (e:Event) => {
                e.preventDefault();
                e.stopPropagation();
                form.classList.add('was-validated');
            });
            
            $('#btn-multi').on('click', (e) => {

                if (form.checkValidity() === false) { 
                    console.log('Invalid form');
                    return;
                }

                console.log('btn-multi click');

                e.preventDefault();

                const d = $('#game-url');
                d.html('Please wait...');

                this.startMulti((id:string) => {
                    d.html(`<a href=\"play.html#${id}\">Click here to start playing</a>` + 
                        '(share this link with other players)');
                });
            });

        });
        
    }

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