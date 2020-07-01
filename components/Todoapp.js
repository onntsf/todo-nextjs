const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
const TODOFILTER = {
  all: 'all',
  active: 'active',
  completed: 'completed',
};

class Todoapp extends React.Component {
  constructor(props) {
    super(props);
    const util = new Util();
    this.state = {
      todos: [],
      todofilter: TODOFILTER.all,
      util: util,
      // todo内容編集時の編集前の状態保存
      tmpVal: '',
    };
  }

  componentDidMount() {
    this.setState({
      todos: this.state.util.store('todos-jquery'),
    });
  }

  // 新しいtodo作成
  create(e){
    e.preventDefault();    
    const input = e.target;
    const val = input.value.trim();

    if (e.which !== ENTER_KEY || !val) {
      return;
    }

    this.setState({
      todos:  
      this.state.todos.concat([{
        id: this.state.util.uuid(),
        title: val,
        completed: false
      }])
    });

    input.value = '';
  }

  // todoの完了/未完了切り替え
  toggle(e) {
    const id = e.target.getAttribute('data-id');  
    this.setState({
      todos: this.state.todos.map(todo => {
        if(todo.id===id){
          todo.completed = !todo.completed;
        }
        return todo;
      })
    });
  }

  // 全てチェックまたは全てチェックを外す
  toggleAll(e) {
    // 1つでも完了していないtodoがあれば全てにチェック
    // 全て完了していれば全てのチェックをはずす
    const completed = this.haveActive();

    this.setState({
      todos: this.state.todos.map(todo => {
        todo.completed = completed;
        return todo;
      })
    });
  }

  // 完了したtodoがあるか検索
  haveCompleted() {
    return this.state.todos.find(todo => todo.completed)
      ?  true : false;
  }

  // 完了していないtodoがあるか検索
  haveActive() {
    return this.state.todos.find(todo => !todo.completed) 
      ?  true : false;
  }


  // todoが完了していればcompletedを返す
  getLiClass(id) {
    return this.state.todos.find(todo => (todo.id === id && todo.completed)) 
      ? 'completed' : null; 
  }

  // 未完了todoをカウント
  todoCount() {
    return this.state.todos.filter(todo => !todo.completed).length;
  }

  // todoを編集可状態に変更
  editingMode (e) {
    const li = e.target.parentNode.parentNode;
    const input = Array.from(li.childNodes)
      .find(element => element.className === 'edit');

    li.classList.add('editing');
    input.focus();
  }

  // 編集前のtodo名を記憶
  keepVal(e) {
    if(this.state.tmpVal === '') {
      this.state.tmpVal = e.target.value;
    }
  }

  // todo名を入力された値に設定
  editChange(e) {
    const id = e.target.getAttribute('data-id');

    this.setState({
      todos: this.state.todos.map(todo => {
        if(todo.id === id) {
          todo.title = e.target.value.trim();
        }
        return todo;
      })
    });
  }

  // Enter, Escapeキーを押された時の動作
  editKeyup(e) {
    if (e.which === ENTER_KEY || e.which === ESCAPE_KEY) {
      const id = e.target.getAttribute('data-id');

      if(e.which === ENTER_KEY && !e.target.value) {
        this.destroy(id);
      }
      if (e.which === ESCAPE_KEY && this.state.tmpVal !== '') {
        this.setState({
          todos: this.state.todos.map(todo => {
            if(todo.id == id) {
              todo.title = this.state.tmpVal;
            }
            return todo;
          })
        });
      }
      e.target.blur();
    }
  }

  // todoの削除
  destroy(id) {
    this.setState({
      todos: this.state.todos.filter(todo => 
        todo.id !== id 
      )
    });
  }

  // todo名編集の終了
  endEditingMode(e) {
    const li = e.target.parentNode;
    li.classList.remove('editing');
    this.state.tmpVal = '';
  }

  // todo表示フィルタを設定
  getSelectedFilter(name) {
    return name  === this.state.todofilter
      ? 'selected' : '';
  }

  // 完了したtodoを削除
  clearCompleted() {
    this.setState({
      todos: this.state.todos.filter(todo => !todo.completed)
    });
  }


  // todoリストの表示
  todolist() {
    let todos = this.state.todos;
    const selectedFilter = this.state.todofilter;

    if(selectedFilter === TODOFILTER.completed) {
      todos = todos.filter(todo => todo.completed);
    }
    else if(selectedFilter === TODOFILTER.active) {
      todos = todos.filter(todo => !todo.completed);
    }

    return todos.map(todo => (
      <li className={this.getLiClass(todo.id)} data-id={todo.id}>
        <div className="view">
          <input 
            data-id={todo.id} 
            className="toggle" 
            type="checkbox" 
            checked={todo.completed} 
            onChange={(e) => this.toggle(e)}
          />
          <label onDoubleClick={(e) => this.editingMode(e)}>{todo.title}</label>
          <button className="destroy" onClick={() => this.destroy(todo.id)}></button>
        </div>
        <input 
          className="edit" 
          data-id={todo.id}
          value={todo.title} 
          onKeyDown={(e) => this.keepVal(e)}
          onKeyUp={(e) => this.editKeyup(e)}
          onChange={(e) => this.editChange(e)}
          onBlur={(e) => this.endEditingMode(e)}
        />
      </li>
    ));
  }

  // 完了todo削除ボタンの表示切り替え
  dispClearCompleted() {
    if(this.haveCompleted()){
      return (
        <button 
          className="clear-completed" 
          onClick={() => this.clearCompleted()}
        >Clear completed</button>
      );
    }
    else{
      return null;
    }
  }

  // フッタの表示切り替え
  dispFooter() {
    return this.state.todos.length == 0 
      ? null : (
        <section className="todo-footer">
          <span className="todo-count">
            <strong>{this.todoCount()}</strong>
              items left
            </span>
            <ul className="todo-filters">
              <li>
                <label 
                  className={this.getSelectedFilter(TODOFILTER.all)}
                  onClick={() => this.setState({todofilter: TODOFILTER.all})}
                >All</label>
              </li>
              <li>
                <label 
                  className={this.getSelectedFilter(TODOFILTER.active)}
                  onClick={() => this.setState({todofilter: TODOFILTER.active})}
                >Active</label>
                </li>
              <li>
                <label 
                  className={this.getSelectedFilter(TODOFILTER.completed)}
                  onClick={() => this.setState({todofilter: TODOFILTER.completed})}
                >Completed</label>
              </li>
            </ul>
            {this.dispClearCompleted()}
        </section>
      );
  }

  // 全て選択ボタンの表示切り替え
  dispToggleAll() {
    return this.state.todos.length == 0 
      ? null : (
        <>
          <input 
            id="toggle-all" 
            className="toggle-all" 
            type="checkbox" 
            onChange={(e) => this.toggleAll(e)}
          />
          <label for="toggle-all">Mark all as complete</label>
        </>
      );
  }

  render() {
    return(
      <section className="todoapp">
        <section className="todo-header">
          <h1>todos</h1>
          <input 
            className="new-todo" 
            placeholder="What needs to be done?" 
            autoFocus 
            onKeyUp={(e) => this.create(e)}
          />
        </section>
        <section className="todo-main">
          {this.dispToggleAll()}
          <ul className="todo-list">{this.todolist()}</ul>
        </section>
        {this.dispFooter()}
      </section>
    )
  }
}

class Util extends React.Component {
  uuid () {
    let i, random;
    let uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
  }

  store(namespace, data) {
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      let store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
  }
}

export default Todoapp
