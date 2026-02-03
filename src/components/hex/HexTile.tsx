import React from 'react';

export type TerrainType = 'grass' | 'forest' | 'water' | 'mountain' | 'desert' | 'swamp';

interface HexTileProps {
  terrain: TerrainType;
  size?: number;
  playerId?: number;
  isOwned?: boolean;
  isCityCenter?: boolean;
  deposit?: number;
  onClick?: () => void;
  className?: string;
}

// Color palettes for each terrain (no gradients, solid colors with patterns)
const terrainColors: Record<TerrainType, { base: string; accent: string; pattern: string }> = {
  grass: { base: '#7cb342', accent: '#558b2f', pattern: '#8bc34a' },
  forest: { base: '#2d5016', accent: '#1b5e20', pattern: '#33691e' },
  water: { base: '#3a7ca5', accent: '#1565c0', pattern: '#42a5f5' },
  mountain: { base: '#6b6b6b', accent: '#4a4a4a', pattern: '#9e9e9e' },
  desert: { base: '#d4a574', accent: '#c4915c', pattern: '#e0c9a6' },
  swamp: { base: '#556b2f', accent: '#3d4f22', pattern: '#6b8e23' },
};

// Player colors for ownership indication
const playerColors = [
  '#c9a227', // Gold
  '#8b0000', // Blood Red
  '#1a3a5c', // Royal Blue
  '#4b0082', // Royal Purple
  '#2d5016', // Forest Green
  '#d4a574', // Desert Sand
  '#3a7ca5', // Water Blue
  '#6b6b6b', // Stone Gray
];

const HexTile: React.FC<HexTileProps> = ({
  terrain,
  size = 80,
  playerId = 0,
  isOwned = false,
  isCityCenter = false,
  deposit = 0,
  onClick,
  className = '',
}) => {
  const colors = terrainColors[terrain];
  const playerColor = playerId > 0 ? playerColors[(playerId - 1) % playerColors.length] : null;

  // Calculate hex dimensions for FLAT-TOP orientation
  // For flat-top: width is the full width, height = width * sqrt(3)/2
  const width = size;
  const height = size * 0.866; // sqrt(3)/2 ratio for flat-top hex

  // Hex path for FLAT-TOP orientation (flat edge at top and bottom)
  // Vertices: top-left, top-right, right-point, bottom-right, bottom-left, left-point
  const hexPath = `
    M ${width * 0.25} 0
    L ${width * 0.75} 0
    L ${width} ${height * 0.5}
    L ${width * 0.75} ${height}
    L ${width * 0.25} ${height}
    L 0 ${height * 0.5}
    Z
  `;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`hex-tile ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <defs>
        {/* Terrain patterns */}
        <pattern id={`grass-pattern-${size}`} patternUnits="userSpaceOnUse" width="10" height="10">
          <rect width="10" height="10" fill={colors.base} />
          <circle cx="2" cy="3" r="1" fill={colors.accent} opacity="0.5" />
          <circle cx="7" cy="8" r="1" fill={colors.pattern} opacity="0.5" />
        </pattern>

        <pattern id={`forest-pattern-${size}`} patternUnits="userSpaceOnUse" width="16" height="16">
          <rect width="16" height="16" fill={terrainColors.grass.base} />
          <polygon points="8,2 12,10 4,10" fill={colors.base} />
          <polygon points="3,8 6,14 0,14" fill={colors.accent} />
          <polygon points="13,6 16,14 10,14" fill={colors.pattern} />
        </pattern>

        <pattern id={`water-pattern-${size}`} patternUnits="userSpaceOnUse" width="20" height="10">
          <rect width="20" height="10" fill={colors.base} />
          <path d="M0,5 Q5,3 10,5 T20,5" stroke={colors.pattern} strokeWidth="1" fill="none" opacity="0.6" />
        </pattern>

        <pattern id={`mountain-pattern-${size}`} patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill={colors.base} />
          <polygon points="10,2 18,18 2,18" fill={colors.accent} />
          <polygon points="10,6 14,14 6,14" fill={colors.pattern} />
        </pattern>

        <pattern id={`desert-pattern-${size}`} patternUnits="userSpaceOnUse" width="12" height="12">
          <rect width="12" height="12" fill={colors.base} />
          <circle cx="3" cy="3" r="1" fill={colors.accent} opacity="0.3" />
          <circle cx="9" cy="9" r="1" fill={colors.pattern} opacity="0.3" />
        </pattern>

        <pattern id={`swamp-pattern-${size}`} patternUnits="userSpaceOnUse" width="14" height="14">
          <rect width="14" height="14" fill={terrainColors.swamp.base} />
          <ellipse cx="7" cy="7" rx="4" ry="2" fill={terrainColors.swamp.accent} opacity="0.4" />
          <line x1="3" y1="10" x2="3" y2="14" stroke={terrainColors.swamp.pattern} strokeWidth="1" />
          <line x1="11" y1="10" x2="11" y2="14" stroke={terrainColors.swamp.pattern} strokeWidth="1" />
        </pattern>

        {/* Clip path for hex shape */}
        <clipPath id={`hex-clip-${size}`}>
          <path d={hexPath} />
        </clipPath>
      </defs>

      {/* Base hex with terrain pattern or solid player color for owned */}
      <path
        d={hexPath}
        fill={isOwned ? `url(#grass-pattern-${size})` : `url(#${terrain}-pattern-${size})`}
      />

      {/* Ownership border */}
      {isOwned && playerColor && (
        <path
          d={hexPath}
          fill="none"
          strokeWidth="4"
        />
      )}

      {/* City center marker */}
      {isCityCenter && (
        <g transform={`translate(${width / 2 - 12}, ${height / 2 - 15})`}>
          {/* Castle/fortress icon */}
          <rect x="4" y="10" width="16" height="14" fill="#5d2e0c" />
          <rect x="0" y="6" width="6" height="18" fill="#8b4513" />
          <rect x="18" y="6" width="6" height="18" fill="#8b4513" />
          <rect x="8" y="0" width="8" height="24" fill="#a0522d" />
          <polygon points="12,0 8,6 16,6" fill={playerColor || '#c9a227'} />
          <rect x="10" y="16" width="4" height="8" fill="#3d2817" />
        </g>
      )}

      {/* House for owned non-city-center tiles */}
      {isOwned && !isCityCenter && playerId > 0 && (
        <g transform={`translate(${width / 2 - 8}, ${height / 2 - 10})`}>
          <polygon points="8,0 16,8 0,8" fill={playerColor || '#8b4513'} />
          <rect x="2" y="8" width="12" height="10" fill="#a0522d" />
          <rect x="6" y="12" width="4" height="6" fill="#3d2817" />
        </g>
      )}

      {/* Hex border */}
      <path
        d={hexPath}
        fill="none"
        stroke="#2d2d2d"
        strokeWidth="2"
      />

      {/* Deposit indicator (small number) */}
      {deposit > 0 && (
        <text
          x={width - 12}
          y={height - 8}
          fontSize="10"
          fontFamily="Cinzel, serif"
          fill="#2d2d2d"
          textAnchor="end"
        >
          {Math.round(deposit)}
        </text>
      )}
    </svg>
  );
};

export default HexTile;
