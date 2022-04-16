import MoodPlayer from './components/mood-player';
import { events } from './events';

function App() {
  return (
    <div className="App">
      <MoodPlayer events={events}></MoodPlayer>
    </div>
  );
}

export default App;
