import React from "react";
import { getLeaderboard } from "../repositories";
import { Player } from "../model";

// Crown icon for top ranks
const CrownIcon: React.FC<{ rank: number }> = ({ rank }) => {
  const colors: Record<number, string> = {
    1: '#ffd700', // Gold
    2: '#c0c0c0', // Silver
    3: '#cd7f32', // Bronze
  };
  
  if (rank > 3) return null;
  
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" style={{ marginRight: '8px' }}>
      <polygon
        points="10,0 13,6 20,6 15,10 17,16 10,12 3,16 5,10 0,6 7,6"
        fill={colors[rank]}
        stroke="#5d2e0c"
        strokeWidth="1"
      />
    </svg>
  );
};

function Leaderboard() {
  const [rows, setRows] = React.useState<Player[]>([]);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    getLeaderboard()
      .then((response) => setRows(response.data))
      .catch(setError);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#d4c090',
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 69, 19, 0.05) 2px,
            rgba(139, 69, 19, 0.05) 4px
          )
        `,
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Title Banner */}
      <div style={{ marginBottom: '32px' }}>
        <svg width="400" height="80" viewBox="0 0 400 80">
          <path
            d="M20 10 L380 10 L380 60 L200 75 L20 60 Z"
            fill="#8b0000"
            stroke="#c9a227"
            strokeWidth="4"
          />
          <text
            x="200"
            y="48"
            textAnchor="middle"
            fontFamily="Cinzel, serif"
            fontSize="28"
            fontWeight="700"
            fill="#f5e6c8"
          >
            HALL OF CHAMPIONS
          </text>
        </svg>
      </div>

      {/* Leaderboard Table */}
      <div
        style={{
          backgroundColor: '#f5e6c8',
          border: '4px solid #8b4513',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        {error ? (
          <div
            style={{
              backgroundColor: '#8b0000',
              color: '#f5e6c8',
              padding: '16px',
              borderRadius: '4px',
              fontFamily: "'IM Fell English', serif",
              textAlign: 'center',
            }}
          >
            The royal scribe has encountered an error: {error.message}
          </div>
        ) : rows.length === 0 ? (
          <div
            style={{
              fontFamily: "'IM Fell English', serif",
              fontSize: '1.1rem',
              color: '#5d2e0c',
              textAlign: 'center',
              padding: '32px',
            }}
          >
            No champions have risen yet...
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#5d2e0c',
                    padding: '12px',
                    borderBottom: '3px solid #8b4513',
                    textAlign: 'left',
                  }}
                >
                  Rank
                </th>
                <th
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#5d2e0c',
                    padding: '12px',
                    borderBottom: '3px solid #8b4513',
                    textAlign: 'left',
                  }}
                >
                  Champion
                </th>
                <th
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#5d2e0c',
                    padding: '12px',
                    borderBottom: '3px solid #8b4513',
                    textAlign: 'right',
                  }}
                >
                  Victories
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(139, 69, 19, 0.05)',
                  }}
                >
                  <td
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#5d2e0c',
                      padding: '12px',
                      borderBottom: '1px solid #d4c090',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <CrownIcon rank={index + 1} />
                    {index + 1}
                  </td>
                  <td
                    style={{
                      fontFamily: "'IM Fell English', serif",
                      fontSize: '1.1rem',
                      color: '#2d2d2d',
                      padding: '12px',
                      borderBottom: '1px solid #d4c090',
                    }}
                  >
                    {decodeURIComponent(row.name)}
                  </td>
                  <td
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#c9a227',
                      padding: '12px',
                      borderBottom: '1px solid #d4c090',
                      textAlign: 'right',
                    }}
                  >
                    {row.clicked}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Back link */}
      <a
        href="/game"
        style={{
          marginTop: '32px',
          fontFamily: "'Cinzel', serif",
          fontSize: '1rem',
          color: '#5d2e0c',
          textDecoration: 'none',
          padding: '12px 24px',
          border: '2px solid #8b4513',
          borderRadius: '4px',
          backgroundColor: '#e8d4a8',
          transition: 'all 0.2s ease',
        }}
      >
        Return to Castle
      </a>
    </div>
  );
}

export const Component = Leaderboard;
