import React from 'react';

const GameManual: React.FC = () => {
  return (
    <div style={{ fontFamily: "'IM Fell English', serif", color: '#2d2d2d', padding: '10px' }}>
      <h3 style={{ borderBottom: '2px solid #8b4513', paddingBottom: '8px', marginBottom: '16px', color: '#8b0000' }}>
        Commander's Field Guide
      </h3>

      <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
        <h4 style={{ color: '#5d2e0c' }}>1. The Objective</h4>
        <p>Conquer the realm by expanding your territory and eliminating opponents. Be the last lord standing.</p>

        <h4 style={{ color: '#5d2e0c', marginTop: '16px' }}>2. Commands</h4>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>move &lt;dir&gt;</strong>: Move your crew (Cost: 1)</li>
          <li><strong>invest &lt;amt&gt;</strong>: Add deposit to current tile (Cost: amt + 1)</li>
          <li><strong>collect &lt;amt&gt;</strong>: Withdraw deposit to budget (Cost: 1)</li>
          <li><strong>shoot &lt;dir&gt; &lt;amt&gt;</strong>: Attack nearest enemy in direction (Cost: amt + 1)</li>
          <li><strong>relocate</strong>: Move City Center to current location (Cost: 5*dist + 10)</li>
          <li><strong>done</strong>: End turn manually</li>
        </ul>

        <h4 style={{ color: '#5d2e0c', marginTop: '16px' }}>3. Directions</h4>
        <p><code>up</code>, <code>down</code>, <code>upleft</code>, <code>upright</code>, <code>downleft</code>, <code>downright</code></p>

        <h4 style={{ color: '#5d2e0c', marginTop: '16px' }}>4. Intelligence</h4>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>opponent</strong>: Returns <code>10 * dist + dir_code</code> to nearest enemy.</li>
          <li><strong>nearby &lt;dir&gt;</strong>: Returns <code>100 * dist + deposit_digits</code>.</li>
        </ul>
        <p style={{ fontSize: '0.9em', fontStyle: 'italic' }}>Dir Codes: UP=1, UPRIGHT=2, DOWNRIGHT=3, DOWN=4, DOWNLEFT=5, UPLEFT=6</p>

        <h4 style={{ color: '#5d2e0c', marginTop: '16px' }}>5. Special Variables (Read-Only)</h4>
        <ul style={{ paddingLeft: '20px', fontSize: '0.95em' }}>
          <li><strong>rows, cols</strong>: Dimensions of the territory.</li>
          <li><strong>currow, curcol</strong>: Current coordinates of your city crew.</li>
          <li><strong>budget</strong>: Your remaining budget.</li>
          <li><strong>deposit</strong>: Current cell's deposit. Negative if unowned.</li>
          <li><strong>int</strong>: Interest percentage rate for current cell.</li>
          <li><strong>maxdeposit</strong>: Maximum possible deposit for a region.</li>
          <li><strong>random</strong>: Random value between 0-999.</li>
        </ul>

        <h4 style={{ color: '#5d2e0c', marginTop: '16px' }}>6. Syntax Notes (Important!)</h4>
        <ul style={{ paddingLeft: '20px', fontSize: '0.95em' }}>
          <li><strong>No Comparison Operators</strong>: The language does NOT support <code>&gt;</code>, <code>&lt;</code>, <code>==</code>.</li>
          <li><strong>Conditionals</strong>: <code>if (expression)</code> checks if the result is <strong>positive (&gt; 0)</strong>.</li>
          <li><strong>How to compare:</strong>
            <ul style={{ marginTop: '4px' }}>
              <li><code>if (A - B)</code> means "If A &gt; B". (Assuming non-negative values)</li>
              <li><code>if (val)</code> means "If val &gt; 0".</li>
              <li>To check equality <code>A == B</code>: Use <code>if (A - B) then &#123; not_equal &#125; else &#123; equal &#125;</code>? (Wait, A-B could be negative. If negative, it goes to else. So else catches A &lt;= B. This is tricky.)</li>
            </ul>
          </li>
        </ul>

        <h4 style={{ color: '#5d2e0c', marginTop: '16px' }}>7. Example</h4>
        <pre style={{ backgroundColor: '#f5deb3', padding: '8px', borderRadius: '4px', fontSize: '0.9em' }}>
{`# Loop while budget is greater than 0
while (budget) {
  move up
  # If deposit > 100
  if (deposit - 100) then collect 10 else {}
}`}
        </pre>
      </div>
    </div>
  );
};

export default GameManual;
