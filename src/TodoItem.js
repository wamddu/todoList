function TodoItem({id, text, isDone, onDelete, onToggle, isEditing, editText, onEditStart, onEditTextChange, onEditSubmit, onEditCancel}){
    return(
        <li>
            <input 
                type = "checkbox"
                checked={isDone}
                onChange={() => onToggle(id)}
            />
            {isEditing ? (
                <>
                    <input
                        value = {editText}
                        onChange = {(e) => onEditTextChange(e.target.value)}
                        onKeyDown={(e)=>{
                            if(e.key === 'Enter'){
                                onEditSubmit();
                            }else if(e.key==='Escape'){
                                onEditCancel();
                            }
                        }}
                    />
                    <button onClick={onEditSubmit}>완료</button>
                </>
            ) : (
                <>
            <span style = {{ textDecoration: isDone ? 'line-through' : 'none'}}>
                {text}
            </span>
            <button onClick={()=> onEditStart(id, text)}>수정</button>
            </>
        )}
            <button onClick={()=> onDelete(id)}>삭제</button>
        </li>
    );
}

export default TodoItem;