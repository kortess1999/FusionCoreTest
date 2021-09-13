const express = require('express');
const router = express.Router();
const fs = require('fs');

const updateLvls = ()=>{
    let lvls_now = [];
    fs.readdir('./lvls', (err, files) => {
        if (err) throw err; // не прочитать содержимое папки
        files = files.map(file =>file.substr(0,file.length-5));
        lvls = files
    })
    return lvls_now
}
let lvls = updateLvls();
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('lvls',{lvls:lvls});
});

router.get('/change',async function(req, res, next) {
    let {lvl = null} = req.query;
    let lvlIndex = lvls.indexOf(lvl);
    if(lvlIndex === -1)
    {
        console.log('Неизвестный уровень!');
        res.end(404);
        return
    }
    let thisLvl = JSON.parse(fs.readFileSync(`./lvls/${lvls[lvlIndex]}.json`,'utf8'));
    thisLvl.cellTypes = require('../constants/cellTypes.json');
    thisLvl.file = lvls[lvlIndex];
    res.render('changeLvl', thisLvl);
});

router.post('/saveLvl/', function(req, res, next) {
    try{
        let {
            filename = 'test',
            width = 0,
            height = 0,
            title = ''
        } = req.body;
        let file = [];
        for(let i = 0; i < height; i++){
            file.push([]);
            for(let j = 0; j < width; j++) {
                //Добавление ячейки
                file[i].push({
                    type:req.body[`cellType${i}${j}`],
                    value:req.body[`color${i}${j}`]
                })
            }
        }
        fs.writeFileSync(`./lvls/${filename}.json`,JSON.stringify({
            props:{
                width: width,
                height: height,
                title: title
            },
            data:file
        },null,'\t'))
        res.redirect(req.headers.referer);;
    }catch (e) {
        console.log(`Ошибка сохранения результата: ${e}`);
        res.redirect(req.headers.referer);
    }
});

router.get('/format', function(req, res, next) {
    res.render('formatLvls',{lvls:lvls});
});
router.post('/create', function(req, res, next) {
    //console.log(req.body);
    let {
        lvlFileName = '',
        lvlName = '',
        width = 0,
        height = 0,
    } = req.body
    if(lvlFileName && lvls.indexOf(lvlFileName)===-1 && lvlName && width>0 && height>0)
    {
        let file = {
            props:{
                title:lvlName,
                width:width,
                height:height
            },
            data:[]
        }
        for(let i=0;i<height;i++)
        {
            file.data.push([]);
            for(let j=0;j<width;j++)
                file.data[i].push(
                    {
                        "type": "Не используется",
                        "value": "#000000"
                    }
                )
        }
        fs.writeFileSync(`./lvls/${lvlFileName}.json`,JSON.stringify(file,null,'\t'))
        updateLvls();
    }
    else
        console.log('Файл не добавлен')

    res.redirect('/lvls');
});

router.post('/delete', function(req, res, next) {
    //console.log(req.body);
    let {
        lvlName = ''
    } = req.body;
    if(lvlName || lvls.indexOf(lvlName)>=0)
        fs.unlinkSync(`./lvls/${lvlName}.json`);
    updateLvls();
    res.redirect('/lvls');
});

router.get('/download/:filename', function(req, res, next) {
    let {
        filename = ""
    } = req.params
    console.log(filename);
    if(lvls.indexOf(filename)!==-1)
        res.download(`./lvls/${filename}.json`);
    else
        res.end(404);
});
module.exports = router;
