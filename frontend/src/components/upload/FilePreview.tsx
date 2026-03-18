/**
 * @fileoverview Previsualización del archivo seleccionado antes de procesarlo.
 * Muestra imagen si es posible, o un ícono genérico para PDFs.
 */

import { formatFileSize, truncateFileName } from '@/utils/formatters'
import styles from './upload.module.css'

interface FilePreviewProps {
  file: File
  /** URL de object URL para imágenes, null para PDFs */
  previewUrl: string | null
  /** Callback al pulsar el botón de eliminar */
  onRemove: () => void
}

/**
 * Tarjeta con info del archivo seleccionado y opción de eliminarlo.
 */
export function FilePreview({ file, previewUrl, onRemove }: FilePreviewProps) {
  const isPdf = file.type === 'application/pdf'

  return (
    <div className={styles.previewCard} role="group" aria-label="Archivo seleccionado">
      <div className={styles.previewMedia}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Vista previa de ${file.name}`}
            className={styles.previewImage}
          />
        ) : (
          <div className={styles.previewPdfIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM9 13h6v1H9v-1zm0 2h4v1H9v-1zm-1-6h8v1H8v-1z" />
            </svg>
            <span className={styles.previewPdfLabel}>PDF</span>
          </div>
        )}
      </div>

      <div className={styles.previewInfo}>
        <p className={styles.previewFileName} title={file.name}>
          {truncateFileName(file.name)}
        </p>
        <p className={styles.previewFileMeta}>
          {isPdf ? 'PDF' : file.type.split('/')[1].toUpperCase()} ·{' '}
          {formatFileSize(file.size)}
        </p>
      </div>

      <button
        type="button"
        className={styles.previewRemoveBtn}
        onClick={onRemove}
        aria-label={`Eliminar ${file.name}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
