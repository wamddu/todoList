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
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleAdd = async() =>{
    if(text.trim()==='') return;
    
    try{
      const res = await fetch('http://localhost:5000/api/posts',{
        method : 'POST',
        headers: {
          'Content-Type' : 'application/json',
          'Authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title : text,
          content : text,
        }),
      });

      const created = await res.json();

      console.log('응답:',created);

      const newTodo = {
        id : created._id,
        text : created.title,
        isDone : false
      };

      setTodos((prev) => [...todos, newTodo]);
      setText('');
    }catch(err){
      console.error('추가 실패: ',err);
    }
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

    try{
      const res = await fetch(`http://localhost:5000/api/posts/${id}`,{
        method: 'DELETE',
        headers: {
          'Authorization' : `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      const msg = await res.text();

      if(!res.ok) throw new Error(msg); 

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
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
      const res = await fetch('http://localhost:5000/api/login',{
        method : 'POST',
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({username, password})
      });

      const data = await res.json();
      if(res.ok){
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        alert('로그인 성공!');
      }else{
        alert(data.message || '로그인 실패!');
      }
    }catch(err){
      console.log(err);
      alert('로그인 실패!');
    }
  };

  const handleLogout = () =>{
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setTodos([]);
    alert('로그아웃 되었습니다!');
  };

  const token = localStorage.getItem('token');


  useEffect(()=>{
    const token = localStorage.getItem('token');
    if(token) setIsLoggedIn(true);
    if(!token) return;

    fetch('http://localhost:5000/api/posts',{
      headers: {
        'Authorization' : `Bearer ${token}`,
      },
    })
    .then((res)=> {
      if(!res.ok) return new Error('글 불러오기 실패!');
      return res.json();
    })
    .then((data)=>{
      const mapped = data.map((post)=>({
        id : post._id,
        text : post.title,
        isDone: false
      }));
      setTodos(mapped);
    })
  }, [isLoggedIn]);

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


      {isLoggedIn ? (
        <>
        
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
          <p>로그인 되있음</p>
          <button onClick={handleLogout}>로그아웃</button>
        </>
      ) : (
        <>
          <input value = {username} onChange={(e)=> setUsername(e.target.value)} placeholder='아이디' />
          <input value = {password} onChange={(e) => setPassword(e.target.value)} placeholder = '비밀번호' type = "password" />
          <button onClick={handleRegister}>회원가입</button>
          <button onClick={handleLogin}>로그인</button>
        </>
      )}


      <div>
        {token ? <p>로그인 중</p> : <p>로그인 필요</p>}
      </div>
    </div>
  );
}

export default App;


