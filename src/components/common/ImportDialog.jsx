import { useState, useRef, useCallback } from 'react'
import { colors, fontSizes, fontWeights, spacing, borderRadius } from '../../config/styleConstants'
import { Button } from './index'

function ImportDialog({ open, onClose, onImport, title, multiple = false, description }) {
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState([])
  const [importing, setImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const reset = () => {
    setFiles([])
    setErrors([])
    setImporting(false)
    setDragOver(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const parseFiles = useCallback(async (fileList) => {
    const parsed = []
    const errs = []

    for (const file of fileList) {
      if (!file.name.endsWith('.json')) {
        errs.push(`${file.name}: Nur JSON-Dateien werden unterstützt.`)
        continue
      }

      try {
        const text = await file.text()
        const data = JSON.parse(text)
        parsed.push({ name: file.name, size: file.size, data })
      } catch {
        errs.push(`${file.name}: Ungültiges JSON-Format.`)
      }
    }

    if (!multiple && parsed.length > 1) {
      parsed.splice(1)
      errs.push('Nur eine Datei erlaubt. Erste Datei wurde übernommen.')
    }

    setFiles(parsed)
    setErrors(errs)
  }, [multiple])

  const handleFileSelect = (e) => {
    if (e.target.files?.length) {
      parseFiles(Array.from(e.target.files))
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) {
      parseFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleImport = async () => {
    if (files.length === 0) return
    setImporting(true)
    setErrors([])

    try {
      await onImport(files)
      handleClose()
    } catch (error) {
      setErrors([error.message || 'Import fehlgeschlagen.'])
      setImporting(false)
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div style={{
        background: '#fff',
        borderRadius: borderRadius['2xl'],
        padding: spacing[8],
        width: '480px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        overflow: 'auto',
      }}>
        <h3 style={{
          fontSize: fontSizes.xl,
          fontWeight: fontWeights.bold,
          color: colors.gray[800],
          marginBottom: spacing[3],
        }}>
          {title}
        </h3>

        {description && (
          <p style={{
            fontSize: fontSizes.sm,
            color: colors.gray[600],
            marginBottom: spacing[5],
          }}>
            {description}
          </p>
        )}

        {/* Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: `2px dashed ${dragOver ? colors.purple : colors.gray[300]}`,
            borderRadius: borderRadius.xl,
            padding: `${spacing[8]} ${spacing[6]}`,
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? `${colors.purple}08` : colors.gray[50],
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: spacing[3] }}>📂</div>
          <div style={{ fontSize: fontSizes.md, color: colors.gray[700], fontWeight: fontWeights.semibold }}>
            Klicken oder Dateien hierher ziehen
          </div>
          <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginTop: spacing[2] }}>
            {multiple ? 'Eine oder mehrere .json-Dateien' : 'Eine .json-Datei'}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* File List */}
        {files.length > 0 && (
          <div style={{ marginTop: spacing[5] }}>
            <div style={{
              fontSize: fontSizes.sm,
              fontWeight: fontWeights.semibold,
              color: colors.gray[700],
              marginBottom: spacing[3],
            }}>
              {files.length === 1 ? '1 Datei geladen' : `${files.length} Dateien geladen`}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {files.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${spacing[3]} ${spacing[4]}`,
                    background: colors.status.success.bg,
                    border: `1px solid ${colors.status.success.border}`,
                    borderRadius: borderRadius.lg,
                    fontSize: fontSizes.sm,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <span>✅</span>
                    <div>
                      <div style={{ color: colors.gray[800], fontWeight: fontWeights.semibold }}>
                        {file.name}
                      </div>
                      <div style={{ color: colors.gray[500], fontSize: fontSizes.xs }}>
                        {formatSize(file.size)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(index) }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: colors.gray[400],
                      fontSize: '14px',
                      padding: spacing[1],
                    }}
                    title="Entfernen"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div style={{
            marginTop: spacing[4],
            padding: spacing[4],
            background: colors.status.error.bg,
            border: `1px solid ${colors.status.error.border}`,
            borderRadius: borderRadius.lg,
            fontSize: fontSizes.sm,
            color: colors.status.error.text,
          }}>
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{
          marginTop: spacing[6],
          display: 'flex',
          gap: spacing[3],
          justifyContent: 'flex-end',
        }}>
          <Button onClick={handleClose} variant="secondary">
            Abbrechen
          </Button>
          <Button
            onClick={handleImport}
            disabled={files.length === 0}
            loading={importing}
            icon="📥"
          >
            {importing ? 'Importiere...' : 'Importieren'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ImportDialog
