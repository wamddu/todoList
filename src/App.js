import { useState} from 'react';
import TodoItem from './TodoItem';
import { useEffect } from 'react';

function App(){
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAdd = async() =>{
    if(text.trim()==='') return;
    const newTodo = {
      id : Date.now(),
      text,
      isDone : false,
    };
    setTodos([...todos, newTodo]);
    setText('');

    await fetch('http://localhost:5000/api/posts', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization' : `Bearer ${localStorage.getItem('token')}`
     },
    body: JSON.stringify({
      title: text,
      content: text,
    }),
  });
  };

  const handleEditStart = (id, currentText) =>{
    setEditId(id);
    setEditText(currentText);
  };

  const handleToggle = (id) =>{
    setTodos(
      todos.map((todo)=>
        todo.id === id ? {...todo, isDone : !todo.isDone} : todo
      )
    );
  };

  const handleEditSubmit = async () => {
    setTodos(
      todos.map((todo)=>
        todo.id === editId ? {...todo , text: editText} : todo
      )
    );
    try{
      await fetch(`http://localhost:5000/api/posts/${editId}`,{
        method : 'PUT',
        headers : {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify({text : editText}),
      });
    }catch(err){
      console.error('수정실패:',err);
    }
    
    setEditId(null);
    setEditText('');
  };
  
  const handleDelete = async (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    
    try{
      const res = await fetch(`http://localhost:5000/api/posts/${id}`,{
        method: 'DELETE',
      });

      if(!res.ok) throw new Error('삭제 실패');
    }catch(err){
      console.error(err);
    }

  };

  const handleEditCancel = ()=>{
    setEditId(null);
    setEditText('');
  };

  const handleCancel = () =>{
    setText('');
  };

  const filteredTodos = todos.filter((todo)=>{
    if(filter === 'all') return true;
    else if(filter === 'done') return todo.isDone;
    else if(filter === 'undone') return !todo.isDone;
    else return true;
  });

  const handleRegister = async() =>{
    try{
      const res = await fetch('http://localhost:5000/api/register',{
        method : 'POST',
        headers : { 'Content-Type' : 'application/json'},
        body: JSON.stringify({username, password})
      });

      const text = await res.text();
      alert(text);
    }catch(err){
      console.log(err);
      alert('회원가입 실패!');
    }
  };

  const handleLogin = async() =>{
    try{
      const res = await fetch('http://localhost:5000/api/logiin',{
        method : 'POST',
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({username, password})
      });

      const data = await res.json();
      if(res.ok){
        localStorage.setItem('token', data.token);
        alert('로그인 성공!');
      }else{
        alert(data.message || '로그인 실패!');
      }
    }catch(err){
      console.log(err);
      alert('로그인 실패!');
    }
  };

  const token = localStorage.getItem('token');


  useEffect(()=>{
    fetch('http://localhost:5000/api/posts')
    .then((res)=> res.json())
    .then((data)=>{
      const mapped = data.map((post)=>({
        id : post._id,
        text : post.title,
        isDone: false
      }));
      setTodos(mapped);
    })
  }, []);

  return (
    <div>
      <h1>Todo 리스트</h1>

      <input
        value = {text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e)=>{
          if(e.key==='Enter'){
            handleAdd();
          }else if(e.key=== 'Escape'){
            handleCancel();
          }
        }}
        placeholder='할 일을 입력하세요'
      />
      <button onClick={handleAdd}>추가</button>

      <div>
        <button onClick={() => setFilter('all')}>전체</button>
        <button onClick={() => setFilter('undone')}>미완료</button>
        <button onClick={() => setFilter('done')}>완료</button>
      </div>


      <ul>
        {filteredTodos.map((todo)=>(
          <TodoItem
            key = {todo.id}
            id = {todo.id}
            text = {todo.text}
            isDone = {todo.isDone}
            onDelete={handleDelete}
            onToggle = {handleToggle}
            isEditing={editId === todo.id}
            editText = {editText}
            onEditStart = {handleEditStart}
            onEditTextChange={setEditText}
            onEditSubmit={handleEditSubmit}
            onEditCancel = {handleEditCancel}
          />
        ))}
      </ul>


      <div>
        <h2>회원가입 / 로그인</h2>
        <input
          placeholder = "아이디"
          value = {username}
          onChange = {(e)=> setUsername(e.target.value)}
        />

        <input
          placeholder = "비밀번호"
          value = {password}
          onChange = {(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>회원가입</button>
        <button onClick={handleLogin}>로그인</button>
      </div>


      <div>
        {token ? <p>로그인 상태</p> : <p>로그인 필요</p>}
      </div>
    </div>
  );
}

export default App;


