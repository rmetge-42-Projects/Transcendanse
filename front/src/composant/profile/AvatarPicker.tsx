'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Move, Trash2, ChevronDown, Image as ImageIcon, Sparkles } from 'lucide-react';
import AvatarCropperModal from './AvatarCropperModal';

interface AvatarPickerProps {
  value?: string | null;
  onChange: (file: File | null, dataUrl: string | null) => void;
  error?: string;
  size?: 'md' | 'lg';
}

export default function AvatarPicker({
  value,
  onChange,
  error,
  size = 'md',
}: AvatarPickerProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Synchroniser avec la prop value si elle change
  useEffect(() => {
    if (value !== undefined) {
      setPreview(value);
    }
  }, [value]);

  // Fermer le menu lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Quand l'utilisateur choisit une photo depuis l'explorateur
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setRawImage(reader.result);
          setIsCropperOpen(true); // Ouvre directement la fenêtre d'ajustement
        }
      };
      reader.readAsDataURL(file);
    }
    setIsMenuOpen(false);
  };

  // Validation du recadrage
  const handleCropComplete = (croppedBlob: Blob, croppedDataUrl: string) => {
    setPreview(croppedDataUrl);
    const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
    onChange(file, croppedDataUrl);
  };

  // Suppression de la photo
  const handleRemove = () => {
    setPreview(null);
    setRawImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null, null);
    setIsMenuOpen(false);
  };

  // Déclencher le choix de fichier
  const handleSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setIsMenuOpen(false);
  };

  // Ouvrir l'ajusteur avec l'image actuelle
  const handleAdjustClick = () => {
    if (rawImage || preview) {
      if (!rawImage && preview) {
        setRawImage(preview);
      }
      setIsCropperOpen(true);
    }
    setIsMenuOpen(false);
  };

  const dimensionClasses =
    size === 'lg' ? 'w-32 h-32 md:w-36 md:h-36' : 'w-28 h-28';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Input de fichier masqué */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* APERÇU CIRCULAIRE DE LA PHOTO */}
      <div className="relative group">
        {preview ? (
          <img
            src={preview}
            alt="Photo de profil"
            className={`${dimensionClasses} rounded-full object-cover border-4 border-blue-950 shadow-lg transition-transform duration-200 group-hover:scale-[1.02]`}
          />
        ) : (
          <div
            onClick={handleSelectClick}
            className={`${dimensionClasses} rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 gap-1.5 cursor-pointer hover:bg-gray-200/60 hover:border-blue-950/40 transition`}
            title="Cliquer pour choisir une photo"
          >
            <Camera className="w-7 h-7 text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-500">Aucune photo</span>
          </div>
        )}
      </div>

      {/* BOUTON D'ACTION SOUS L'IMAGE */}
      <div className="relative" ref={menuRef}>
        {!preview ? (
          /* CAS 1 : Aucune photo sélectionnée */
          <button
            type="button"
            onClick={handleSelectClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            Choisir une photo
          </button>
        ) : (
          /* CAS 2 : Une photo est présente -> Bouton menu d'options */
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-blue-950" />
              Modifier la photo
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* MENU DÉROULANT DES OPTIONS (Sélectionner / Ajuster / Supprimer) */}
            {isMenuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                {/* Option 1 : Changer la photo */}
                <button
                  type="button"
                  onClick={handleSelectClick}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-950 transition cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-blue-950" />
                  Sélectionner une photo
                </button>

                {/* Option 2 : Ajuster le cadrage */}
                <button
                  type="button"
                  onClick={handleAdjustClick}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-950 transition cursor-pointer"
                >
                  <Move className="w-4 h-4 text-blue-950" />
                  Ajuster le cadrage
                </button>

                <div className="my-1 border-t border-gray-100"></div>

                {/* Option 3 : Supprimer la photo */}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  Supprimer la photo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs font-medium mt-1">{error}</p>}

      {/* FENÊTRE D'AJUSTEMENT ET RECADRAGE */}
      {rawImage && (
        <AvatarCropperModal
          imageSrc={rawImage}
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
