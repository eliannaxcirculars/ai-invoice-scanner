/**
 * @fileoverview Componente raíz de la aplicación AI Invoice Scanner.
 *
 * Orquesta el flujo principal:
 *  1. El usuario sube una factura (FileUploader)
 *  2. Se procesa con IA vía n8n (useInvoiceProcessor)
 *  3. Se muestran los datos extraídos (InvoiceDisplay)
 *
 * Aplica lazy loading en InvoiceDisplay para optimizar el bundle inicial.
 */

import { lazy, Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Container } from '@/components/layout/Container'
import { FileUploader } from '@/components/upload/FileUploader'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Spinner, ProcessingOverlay } from '@/components/common/Loader'
import { useInvoiceProcessor } from '@/hooks/useInvoiceProcessor'
import { useFileUpload } from '@/hooks/useFileUpload'
import { STATUS_MESSAGES } from '@/utils/constants'
import styles from './App.module.css'

/** Carga diferida — InvoiceDisplay solo se carga cuando hay resultado */
const InvoiceDisplay = lazy(() =>
  import('@/components/invoice/InvoiceDisplay').then((m) => ({
    default: m.InvoiceDisplay,
  }))
)

/**
 * Componente App — punto de entrada de la UI.
 * Combina hooks de estado con componentes de presentación.
 */
function App() {
  const fileState = useFileUpload()
  const { scanResult, uploadProgress, processInvoice, reset } =
    useInvoiceProcessor()

  const handleSubmit = async () => {
    if (!fileState.file) return
    await processInvoice(fileState.file)
  }

  const handleReset = () => {
    fileState.clearFile()
    reset()
  }

  const isProcessing =
    scanResult.status === 'uploading' || scanResult.status === 'processing'

  return (
    <div className={styles.appShell}>
      <Header />

      <main className={styles.main} id="main-content">
        <Container size="md">
          {/* Hero Section */}
          <section className={styles.hero} aria-labelledby="hero-title">
            <h1 id="hero-title" className={styles.heroTitle}>
              Escanea tu factura con IA
            </h1>
            <p className={styles.heroSubtitle}>
              Sube una imagen o PDF y extrae automáticamente todos los datos
              relevantes en segundos.
            </p>
          </section>

          {/* Estado actual accesible */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {STATUS_MESSAGES[scanResult.status]}
          </div>

          {/* Overlay de procesamiento con IA */}
          {scanResult.status === 'processing' && (
            <ProcessingOverlay message="La IA está analizando tu factura..." />
          )}

          {/* Error global */}
          {scanResult.status === 'error' && scanResult.error && (
            <div className={styles.errorBanner} role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <p className={styles.errorBannerTitle}>Error al procesar</p>
                <p className={styles.errorBannerText}>{scanResult.error}</p>
              </div>
              <button
                className={styles.errorBannerDismiss}
                onClick={handleReset}
                aria-label="Cerrar mensaje de error"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Zona de subida — se muestra mientras no hay resultado exitoso */}
          {scanResult.status !== 'success' && (
            <ErrorBoundary>
              <FileUploader
                fileState={fileState}
                uploadProgress={uploadProgress}
                isProcessing={isProcessing}
                onSubmit={handleSubmit}
              />
            </ErrorBoundary>
          )}

          {/* Resultado de la factura — lazy loaded */}
          {scanResult.status === 'success' && scanResult.invoice && (
            <Suspense
              fallback={
                <div className={styles.loadingFallback}>
                  <Spinner label="Cargando resultado..." />
                </div>
              }
            >
              <ErrorBoundary>
                <InvoiceDisplay
                  invoice={scanResult.invoice}
                  onScanAnother={handleReset}
                />
              </ErrorBoundary>
            </Suspense>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default App
