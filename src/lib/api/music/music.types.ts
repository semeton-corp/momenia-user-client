export type Music = {
  id: string
  title: string
  artist: string
  musicKey: string
  musicUrl: string
  contentType: string
  durationSeconds: number
  isActive: boolean
  // Per-bar amplitude (0-100), computed once at upload time in the admin CMS. Absent/
  // invalid for tracks uploaded before that existed — callers fall back to a deterministic
  // placeholder shape (see fallbackWaveformBars in InvitationEditorClient.tsx).
  waveform: number[]
}
