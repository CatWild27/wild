const mains = require('./main.js');
function up1() {

    module.exports.t = mains.eta;
    module.exports.p = mains.queue;

    console.log('Позиция'+ ': ' + mains.queue + '    ' + 'Время' + ': ' + mains.eta  );
    setTimeout(up1 , 5000)
};
module.exports = {
    up1 : up1
}

