import { useDispatch, useSelector } from 'react-redux';
import {
  decrement,
  increment,
  incrementByAmount,
  resetCounter,
  setStep,
} from '../features/counter/counterSlice';

export default function CounterLab() {
  const dispatch = useDispatch();
  const { step, value } = useSelector((state) => state.counter);

  return (
    <section className="lab-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Slice 2</p>
          <h2>Counter reducers</h2>
        </div>
        <strong className="counter-value">{value}</strong>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="field-label">
          Increment amount
          <input
            min="1"
            type="number"
            value={step}
            onChange={(event) => dispatch(setStep(event.target.value))}
          />
        </label>
        <button
          className="primary-button"
          type="button"
          onClick={() => dispatch(incrementByAmount(step))}
        >
          Add {step}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button className="secondary-button" type="button" onClick={() => dispatch(decrement())}>
          -1
        </button>
        <button className="secondary-button" type="button" onClick={() => dispatch(increment())}>
          +1
        </button>
        <button className="secondary-button" type="button" onClick={() => dispatch(resetCounter())}>
          Reset
        </button>
      </div>
    </section>
  );
}
