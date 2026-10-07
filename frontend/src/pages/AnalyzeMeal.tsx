import { ArrowRight, Camera, Check, FileImage, ImagePlus, RotateCcw, Sparkles, Trash2, UploadCloud } from 'lucide-react'
import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { mealApi } from '../api/mealApi'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { InlineAlert } from '../components/ui/PageStates'
import { useFilePreview } from '../hooks/useMealImage'
import { formatBytes } from '../lib/format'
import { getErrorMessage } from '../lib/errors'
import { saveMealImage } from '../lib/mealImageCache'

const MAX_IMAGE_SIZE = 20 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

export function AnalyzeMeal() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const preview = useFilePreview(file)
  const navigate = useNavigate()

  const chooseFile = (candidate?: File) => {
    if (!candidate) return
    setError('')
    if (!ACCEPTED_TYPES.includes(candidate.type)) { setFile(null); setError('Choisissez une image JPEG ou PNG.'); if (inputRef.current) inputRef.current.value = ''; return }
    if (candidate.size > MAX_IMAGE_SIZE) { setFile(null); setError('La taille maximale acceptée est de 20 Mo.'); if (inputRef.current) inputRef.current.value = ''; return }
    setFile(candidate)
  }
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]) }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); inputRef.current?.click() } }
  const analyze = async () => {
    if (!file || analyzing) return
    setAnalyzing(true); setError('')
    try {
      const result = await mealApi.analyze(file)
      try { await saveMealImage(result.mealId, file) } catch { /* L’analyse est disponible même si le cache local n’est pas. */ }
      navigate(`/meals/${result.mealId}`, { state: { meal: result, imageFile: file } })
    } catch (cause) { setError(getErrorMessage(cause, 'L’analyse du repas a échoué.')) }
    finally { setAnalyzing(false) }
  }

  return (
    <div className="page-stack analyze-page">
      <div className="page-heading"><div><span className="page-eyebrow"><span className="eyebrow-dot" /> UNE NOUVELLE PERSPECTIVE</span><h1>Qu’y a-t-il dans votre assiette&nbsp;?</h1><p>Une photo nette aide l’IA à reconnaître les aliments et à vous donner des repères nutritionnels.</p></div><span className="heading-decor"><Sparkles size={22} /></span></div>
      {error && <InlineAlert>{error}</InlineAlert>}
      <Card className={`upload-card ${dragging ? 'upload-card-dragging' : ''} ${file ? 'upload-card-selected' : ''}`}>
        {!file ? <div className="upload-empty" onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onKeyDown={onKeyDown} role="button" tabIndex={0} aria-label="Choisir une image ou la déposer ici" onClick={() => inputRef.current?.click()}>
          <div className="upload-icon-wrap"><UploadCloud size={24} strokeWidth={1.7} /></div><p className="upload-title">Déposez votre photo ici</p><p className="upload-subtitle">ou choisissez une image depuis votre appareil</p><Button variant="secondary" type="button" icon={<ImagePlus size={16} />} onClick={(event) => { event.stopPropagation(); inputRef.current?.click() }}>Parcourir les fichiers</Button><p className="upload-formats">JPEG ou PNG <span>·</span> jusqu’à 20 Mo</p>
        </div> : <div className="upload-selected">
          {preview && <div className="preview-frame"><img src={preview} alt="Aperçu du repas à analyser" /></div>}
          <div className="selected-file-info"><span className="file-type-icon"><FileImage size={19} /></span><div className="selected-file-copy"><strong>{file.name}</strong><span>{formatBytes(file.size)} · Image prête à analyser</span></div><span className="file-ready"><Check size={14} /> Prête</span></div>
          <div className="upload-actions"><Button variant="ghost" icon={<Trash2 size={15} />} onClick={() => { setFile(null); setError(''); if (inputRef.current) inputRef.current.value = '' }}>Retirer l’image</Button><Button loading={analyzing} onClick={() => void analyze()} icon={!analyzing ? <Camera size={16} /> : undefined}>{analyzing ? 'Analyse en cours…' : 'Analyser le repas'}{!analyzing && <ArrowRight size={16} />}</Button></div>
          {analyzing && <div className="analysis-progress"><span className="analysis-progress-bar" /><div><strong>Nous regardons votre assiette…</strong><span>Identification des aliments et préparation de vos repères.</span></div><RotateCcw size={16} className="spin" /></div>}
        </div>}
        <input ref={inputRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" aria-label="Choisir une image de repas" onChange={(event) => chooseFile(event.target.files?.[0])} />
      </Card>
      <div className="upload-note"><span className="note-mark"><Check size={14} /></span><p><strong>Quelques conseils</strong> — privilégiez une photo bien éclairée, vue du dessus, où l’assiette est entièrement visible.</p></div>
      <div className="privacy-note"><span>PRIVÉ PAR CONCEPTION</span><p>Votre image est transmise à l’API SmartMeal pour l’analyse. Une copie de confort est gardée localement dans ce navigateur pour l’afficher dans votre historique.</p></div>
    </div>
  )
}
