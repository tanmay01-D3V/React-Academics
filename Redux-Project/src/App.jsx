import { useSelector } from 'react-redux';
import CartLab from './components/CartLab';
import CounterLab from './components/CounterLab';
import Header from './components/Header';
import ProductsLab from './components/ProductsLab';
import ReduxInspector from './components/ReduxInspector';
import TodoLab from './components/TodoLab';
import UserLab from './components/UserLab';

const App = () => {
  const theme = useSelector((state) => state.user.theme);

  return (
    <main className={`min-h-screen app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <Header />
      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5">
          <UserLab />
          <CounterLab />
          <TodoLab />
        </div>
        <div className="grid content-start gap-5">
          <ProductsLab />
          <CartLab />
          <ReduxInspector />
        </div>
      </section>
    </main>
  );
};

export default App;
