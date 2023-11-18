import { Link } from 'react-router-dom';

function App() {
  return (
    <div>
      <div>
        <Link to="/mirror">mirror</Link>
      </div>
      <div>
        <Link to="/embed">embed</Link>
      </div>
    </div>
  );
}

export default App;
