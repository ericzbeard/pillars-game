
const loadContent = (path:string) => {
    $.ajax(path, {
        method: 'get', 
        success: (content) => {
            $('#content').html(content);
        }
    });
};

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
    default:
        break;
}

loadContent(page);

$('#rules-link').on('click', () => {

    loadContent('pages/rules.html');
  
});
