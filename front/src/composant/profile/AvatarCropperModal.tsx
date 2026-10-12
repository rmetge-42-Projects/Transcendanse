'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Move, Sparkles } from 'lucide-react';

interface AvatarCropperModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void;
}

const VIEWPORT_SIZE = 260; // Taille en pixels de la zone circulaire de cadrage

export default function AvatarCropperModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
}: AvatarCropperModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalDim, setNaturalDim] = useState({ width: 0, height: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Charger les dimensions naturelles de l'image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setNaturalDim({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  // Calculer les dimensions de base pour remplir le cercle (object-fit: cover)
  const getBaseDimensions = useCallback(() => {
    if (!naturalDim.width || !naturalDim.height) {
      return { width: VIEWPORT_SIZE, height: VIEWPORT_SIZE };
    }

    const isRotated90or270 = rotation === 90 || rotation === 270;
    const imgW = isRotated90or270 ? naturalDim.height : naturalDim.width;
    const imgH = isRotated90or270 ? naturalDim.width : naturalDim.height;
    const aspect = imgW / imgH;

    if (aspect > 1) {
      // Image plus large que haute
      return { width: VIEWPORT_SIZE * aspect, height: VIEWPORT_SIZE };
    } else {
      // Image plus haute que large
      return { width: VIEWPORT_SIZE, height: VIEWPORT_SIZE / aspect };
    }
  }, [naturalDim, rotation]);

  // Clamper la position pour ne pas sortir du cadre circulaire
  const clampPosition = useCallback(
    (pos: { x: number; y: number }, currentScale: number) => {
      const base = getBaseDimensions();
      const currentW = base.width * currentScale;
      const currentH = base.height * currentScale;

      const maxX = Math.max(0, (currentW - VIEWPORT_SIZE) / 2);
      const maxY = Math.max(0, (currentH - VIEWPORT_SIZE) / 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, pos.x)),
        y: Math.min(maxY, Math.max(-maxY, pos.y)),
      };
    },
    [getBaseDimensions]
  );

  // Gestion du drag (souris et tactile)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newPos = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    setPosition(clampPosition(newPos, scale));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newPos = {
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    };
    setPosition(clampPosition(newPos, scale));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom avec la molette
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    const newScale = Math.min(3, Math.max(1, scale + delta));
    setScale(newScale);
    setPosition((prev) => clampPosition(prev, newScale));
  };

  // Changement du slider zoom
  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    setPosition((prev) => clampPosition(prev, newScale));
  };

  // Rotation
  const handleRotate = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Réinitialiser le cadrage
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Génération du rendu final via Canvas HTML5
  const handleValidate = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const OUTPUT_SIZE = 384; // Résolution optimale pour avatar net et très léger
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Facteur d'échelle écran -> canvas
    const ratio = OUTPUT_SIZE / VIEWPORT_SIZE;

    // Remplir avec fond transparent / centrage
    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // Activer l'antialiasing haute qualité
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    // Déplacer l'origine au centre du canvas
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);

    // Appliquer le déplacement utilisateur
    ctx.translate(position.x * ratio, position.y * ratio);

    // Appliquer la rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Appliquer le zoom
    ctx.scale(scale, scale);

    // Dimensions de l'image de base (non tournée pour le dessin)
    const base = getBaseDimensions();
    const isRotated90or270 = rotation === 90 || rotation === 270;
    const drawW = (isRotated90or270 ? base.height : base.width) * ratio;
    const drawH = (isRotated90or270 ? base.width : base.height) * ratio;

    // Dessiner l'image centrée
    ctx.drawImage(
      imageRef.current,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH
    );

    ctx.restore();

    // Exporter en Blob et DataURL (JPEG léger et net)
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onCropComplete(blob, dataUrl);
          onClose();
        }
      },
      'image/jpeg',
      0.85
    );
  };

  if (!isOpen) return null;

  const baseDim = getBaseDimensions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 flex flex-col">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-950">
            <Move className="w-5 h-5 text-blue-900" />
            <h2 className="font-bold text-lg">Ajuster la photo de profil</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone de recadrage interactive */}
        <div className="p-6 flex flex-col items-center select-none">
          <p className="text-xs text-gray-500 mb-4 text-center">
             <b>Glissez</b> la photo pour la centrer • <b>Zoomez</b> avec le curseur ou la molette
          </p>

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
            className={`relative rounded-full overflow-hidden cursor-grab active:cursor-grabbing border-4 border-blue-950 shadow-2xl bg-gray-900 flex items-center justify-center touch-none`}
          >
            {/* Image manipulable */}
            {imageLoaded && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Source pour recadrage"
                draggable={false}
                style={{
                  width: `${baseDim.width}px`,
                  height: `${baseDim.height}px`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                }}
                className="pointer-events-none select-none object-cover"
              />
            )}

            {/* Repère central en croix subtil pour aider au centrage */}
            <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
              <div className="w-full h-px border-t border-dashed border-white"></div>
              <div className="h-full w-px border-l border-dashed border-white absolute"></div>
            </div>
          </div>

          {/* Contrôles de zoom et d'orientation */}
          <div className="w-full mt-6 space-y-4">
            {/* Slider de zoom */}
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-200/80">
              <button
                type="button"
                onClick={() => handleScaleChange(Math.max(1, scale - 0.2))}
                className="text-gray-500 hover:text-blue-950 p-1"
                title="Dézoomer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="w-full accent-blue-950 cursor-pointer h-2 bg-gray-200 rounded-lg"
              />

              <button
                type="button"
                onClick={() => handleScaleChange(Math.min(3, scale + 0.2))}
                className="text-gray-500 hover:text-blue-950 p-1"
                title="Zoomer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-blue-950 min-w-[40px] text-right">
                {Math.round(scale * 100)}%
              </span>
            </div>

            {/* Boutons d'actions secondaires : Rotation & Réinitialiser */}
            <div className="flex items-center justify-between text-xs text-gray-600 px-1">
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-gray-100 font-medium transition"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Pivoter 90°
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-1.5 px-3 rounded-lg hover:bg-gray-100 font-medium text-gray-500 transition"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200/70 rounded-xl transition"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleValidate}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-950 hover:bg-blue-900 rounded-xl shadow-md shadow-blue-950/20 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Valider le cadrage
          </button>
        </div>
      </div>
    </div>
  );
}
