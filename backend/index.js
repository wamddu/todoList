const express = require('express');
const cors  = require('cors');
const app = express();
const mongoose = require('mongoose');


mongoose.connect('mongodb+srv://yhy6923:tjddms090@first.6afe4ag.mongodb.net/?retryWrites=true&w=majority&appName=first',{
}).then(()=>{
    console.log('DB 연결 성공!');
}).catch((err)=>{
    console.error('DB 연결 실패!');
    console.log(err);
});

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author : String,
});

const Post = mongoose.model('Post', postSchema);

app.use(cors());
app.use(express.json());

app.post('/api/posts', async(req, res)=>{
    const {title, content, author} = req.body;
    
    try{
        const newPost = await Post.create({ title, content, author});
        res.json(newPost);
    }catch(err){
        console.log(err);
        res.status(500).send('글 저장 실패!');
    }
});

app.delete('/api/posts/:id', async(req,res)=>{
    const {id} = req.params;
    try{
        await Post.findByIdAndDelete(id);
        res.send('삭제 완료');
    }catch(err) {
        console.log(err);
        res.status(500).send('삭제 실패');
    }
})

app.put('/api/posts/:id', async (req, res)=>{
    const {id} = req.params;
    const {text} = req.body;

    try{
        const updated = await Post.findByIdAndUpdate(id,{title : text, content : text}, {new : true});
        res.json(updated);
    }catch(err){
        console.log(err);
        res.status(500).send('수정 실패'); 
    }
});

app.get('/api/posts', async(req,res)=>{
    try{
        const posts = await Post.find().sort({_id : -1});
        res.json(posts);
    }catch(err){
        console.log(err);
        res.status(500).send('목록 불러오기 실패!');
    }
});

app.get('/api/test', (req, res)=>{
    res.json({ message: '백엔드 연결 성공!'});
});

app.listen(5000,()=>{
    console.log('서버 실행 중http://localhost:5000');
});