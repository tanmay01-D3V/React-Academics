import { useSelector } from 'react-redux';

export default function ReduxInspector() {
  const state = useSelector((storeState) => storeState);

  return (
    <section className="lab-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Live state</p>
          <h2>Redux inspector</h2>
        </div>
      </div>

      <pre className="state-view">{JSON.stringify(state, null, 2)}</pre>
    </section>
  );
}
