/**
 * @fileoverview Componente principal de subida de facturas.
 * Implementa drag-and-drop y click-to-select con accesibilidad completa.
 * Toda la lógica de estado vive en useFileUpload (SRP).
 */

import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/common/Button'
import { FilePreview } from './FilePreview'
import { ProgressBar } from './ProgressBar'
import { ACCEPTED_EXTENSIONS } from '@/utils/constants'
import type { UseFileUploadReturn } from '@/hooks/useFileUpload'
import styles from './upload.module.css'

interface FileUploaderProps {
  /** Estado y handlers del hook useFileUpload */
  fileState: UseFileUploadReturn
  /** Progreso de subida 0–100 */
  uploadProgress: number
  /** Si el formulario está en proceso de envío */
  isProcessing: boolean
  /** Callback al pulsar "Escanear factura" */
  onSubmit: () => void
}

/**
 * Zona de drop + selector de archivo + preview + botón de acción.
 * Componente puro: recibe todo vía props, sin lógica de negocio propia.
 */
export function FileUploader({
  fileState,
  uploadProgress,
  isProcessing,
  onSubmit,
}: FileUploaderProps) {
  const { file, previewUrl, validationError, handleFileSelect, clearFile } = fileState
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    []
  )

  const isUploading = uploadProgress > 0 && uploadProgress < 100

  return (
    <section className={styles.uploaderSection} aria-label="Subir factura">
      {!file ? (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Zona de arrastre. Pulsa Enter o haz clic para seleccionar un archivo"
        >
          <div className={styles.dropIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          <p className={styles.dropTitle}>
            Arrastra tu factura aquí
          </p>
          <p className={styles.dropSubtitle}>
            o <span className={styles.dropLink}>selecciona un archivo</span>
          </p>
          <p className={styles.dropHint}>
            JPG, PNG, WEBP o PDF · Máximo 10 MB
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            className={styles.hiddenInput}
            onChange={(e) => handleFileSelect(e.target.files)}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      ) : (
        <div className={styles.selectedFileArea}>
          <FilePreview
            file={file}
            previewUrl={previewUrl}
            onRemove={clearFile}
          />

          {isUploading && (
            <ProgressBar
              value={uploadProgress}
              label="Subiendo archivo a la nube"
            />
          )}

          {validationError && (
            <p className={styles.errorMessage} role="alert">
              {validationError}
            </p>
          )}

          <div className={styles.actionRow}>
            <Button
              variant="secondary"
              size="md"
              onClick={clearFile}
              disabled={isProcessing}
            >
              Cambiar archivo
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onSubmit}
              isLoading={isProcessing}
              loadingText="Procesando factura..."
              disabled={isProcessing}
              leftIcon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              }
            >
              Escanear con IA
            </Button>
          </div>
        </div>
      )}

      {validationError && !file && (
        <p className={styles.errorMessage} role="alert">
          {validationError}
        </p>
      )}
    </section>
  )
}
