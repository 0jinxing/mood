import { Link } from 'react-router-dom';

function App() {
  return (
    <div>
      <div>
        <Link to="/mirror" target="_blank">
          mirror
        </Link>
      </div>
      <div>
        <Link to="/embed" target="_blank">
          embed
        </Link>
      </div>
    </div>
  );
}

export default App;
