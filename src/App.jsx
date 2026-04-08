import React, { useState } from 'react'; // MUST HAVE THIS
import Quotation from './Quotation';
import Login from './Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="App">
      {!isLoggedIn ? (
        // Check this line carefully!
        <Login onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <Quotation />
      )}
    </div>
  );
}

export default App;