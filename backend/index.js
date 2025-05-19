    const express = require('express');
const cors  = require('cors');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'supersecretkey123';

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

const userSchema = new mongoose.Schema({
    username : { type : String, required : true, unique : true},
    password: { type : String, required: true},
});

const User = mongoose.model('User', userSchema);

const Post = mongoose.model('Post', postSchema);

app.use(cors());
app.use(express.json());

app.post('/api/login', async (req,res)=>{
    const {username, password} = req.body;

    try{
        const user = await User.findOne({username});
        if(!user) return res.status(401).send('존재하지 않는 사용자입니다.');

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(401).send('비밀번호가 틀렸습니다!');

        const token = jwt.sign({ userId: user._id}, 'supersecretkey123', {expiresIn: '1h'});

        res.json({message : '로그인 성공', token});
    }catch(err){
        console.error(err);
        res.status(500).send('로그인 실패');
    }
});

app.post('/api/posts',authMiddleware, async(req, res)=>{
    const {title, content} = req.body;
    try{
        const newPost = await Post.create({ title, content, author : req.userId});
        res.json(newPost);
    }catch(err){
        console.log(err);
        res.status(500).send('글 저장 실패!');
    }
});

app.post('/api/register', async(req, res) => {
    const {username, password} = req.body;

    try{
        const existingUser = await User.findOne({username});
        if(existingUser) return res.status(400).send('이미 존재하는 사용자명입니다');

        const hashed = await bcrypt.hash(password,10);

        const newUser = await User.create({username, password: hashed});

        res.status(201).send('회원가입 완료!');
    }catch(err){
        console.error(err);
        res.status(500).send('회원가입 실패!');
    }
});

app.delete('/api/posts/:id',authMiddleware, async(req,res)=>{
    const {id} = req.params;
    try{
        const result  = await Post.deleteOne({_id : id, author : req.userId});
        if(result.deletedCount === 0){
            return res.status(403).send('삭제 권환이 없습니다.');
        }
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

app.get('/api/posts',authMiddleware, async(req,res)=>{
    try{
        const posts = await Post.find({author : req.userId});
        console.log(req.userId);    
        res.json(posts);
    }catch(err){
        console.log(err);
        res.status(500).send('목록 불러오기 실패!');
    }
});

app.get('/api/test', (req, res)=>{
    res.json({ message: '백엔드 연결 성공!'});
});

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send('토큰 없음');
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch(err){
        console.error(err);
        res.status(401).send('유효하지 않은 토큰');
    }
}

app.listen(5000,()=>{
    console.log('서버 실행 중http://localhost:5000');
});