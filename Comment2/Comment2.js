const express = require('express');
const app = express();
const fs = require('fs');
const sd = require('silly-datetime');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

let floor = 2;
//连接数据库
let collection;
MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
    let dbase = db.db("mydb");
    collection = dbase.collection("comments");
})

app.use(express.static('./public'));

let oldHtmlContent = fs.readFileSync('./index.html').toString(); //读取index.html文

app.get('/', (req, res) => {
        floor = 2;
        res.send(oldHtmlContent);
        collection.deleteMany(); //清空数据表
    })
    //处理评论请求
app.get('/comment', async function(req, res) {
    floor++;
    newcommment = req.query.comment; //查询字符串
    collection.insertOne({ floorNumber: floor, comment: newcommment, datetime: sd.format(new Date(), 'YYYY-MM-DD HH:mm') }); //插入数据
    render().then((result) => {
        res.send(result);
    })
})

//提取记录
function getComment() {
    return new Promise((resolve, reject) => {
        collection.find().sort({ 'floorNumber': 1 }).toArray((err, result) => { //按楼号排序
            if (err) reject();
            else resolve(result);
        })
    })
}

//更新html文档
async function render() {
    newHtmlContent = '';
    await getComment().then((result) => {
        for (let comment of result) {
            newHtmlContent =
                `<div class="comment">
                    <span class="comment-avatar">
                    <img src="avatar1.jpg" alt="avatar">
                    </span>
                    <div class="comment-content">
                        <p class="comment-content-name">EdmundDZhang</p>
                        <p class="comment-content-article">${comment['comment']}</p>
                        <p class="comment-content-footer">
                            <span class="comment-content-footer-id">#${comment['floorNumber']}</span>
                            <span class="comment-content-footer-device">来自安卓客户端</span>
                            <span class="comment-content-footer-timestamp">${comment['datetime']}</span>
                        </p>
                    </div>
                    <div class="cls"></div>
                    </div>` + newHtmlContent;
        }
    })
    return oldHtmlContent.replace('<div class="comment-list" id="commentList">', '<div class="comment-list" id="commentList">\n' + newHtmlContent)
}

app.listen(8888, '127.0.0.1');
