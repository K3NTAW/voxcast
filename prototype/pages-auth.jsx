// pages-auth.jsx — Login, Onboarding

function LoginPage({ onNav }) {
  return (
    <div className="auth-shell">
      <div className="hero-bg"/>
      <div className="auth-card card card-pad-lg fade-in" style={{position:"relative", padding: 32}}>
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", marginBottom: 20}}>
          <span className="wordmark lg" style={{marginBottom: 18}}>Relay</span>
          <h1 className="text-h2" style={{margin: "0 0 6px", textAlign:"center"}}>Sign in to your stream booth</h1>
          <p className="text-sm text-muted" style={{margin: 0, textAlign:"center"}}>Pick a provider. We never see your password.</p>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap: 8, marginBottom: 18}}>
          <OauthProviderButton provider="twitch">Continue with Twitch</OauthProviderButton>
          <OauthProviderButton provider="google">Continue with Google</OauthProviderButton>
          <OauthProviderButton provider="discord">Continue with Discord</OauthProviderButton>
        </div>
        <div style={{textAlign:"center"}}>
          <Button variant="link" size="sm" onClick={() => onNav("/onboarding")}>Continue as demo →</Button>
        </div>
        <div className="separator" style={{margin: "18px 0"}}/>
        <p className="text-xs text-muted" style={{margin: 0, textAlign:"center"}}>
          By continuing, you agree to our <a onClick={() => onNav("/terms")} style={{cursor:"pointer", color:"var(--color-accent)"}}>Terms</a> and <a onClick={() => onNav("/privacy")} style={{cursor:"pointer", color:"var(--color-accent)"}}>Privacy</a>.
        </p>
      </div>
    </div>
  );
}

function OnboardingPage({ onNav }) {
  const [step, setStep] = React.useState(0);
  const [locale, setLocale] = React.useState("en-US");
  const [target, setTarget] = React.useState("es");
  const [dgKey, setDgKey] = React.useState("");
  const [dlKey, setDlKey] = React.useState("");

  const next = () => {
    if (step < 2) setStep(step + 1);
    else onNav("/dashboard");
  };
  const back = () => step > 0 && setStep(step - 1);

  return (
    <div className="auth-shell">
      <div className="hero-bg"/>
      <div className="auth-card fade-in" style={{position:"relative", width: 480}}>
        <div style={{textAlign:"center", marginBottom: 28}}>
          <span className="wordmark lg">Relay</span>
        </div>

        <div className="card card-pad-lg" style={{padding: 28}}>
          <div className="stepper">
            <div className={`step ${step > 0 ? "done" : step === 0 ? "current" : ""}`}/>
            <div className={`step ${step > 1 ? "done" : step === 1 ? "current" : ""}`}/>
            <div className={`step ${step === 2 ? "current" : ""}`}/>
          </div>

          <div className="text-xs text-muted" style={{marginBottom: 4}}>Step {step + 1} of 3</div>

          {step === 0 && (
            <>
              <h2 className="text-h3" style={{margin: "0 0 6px"}}>Pick your languages</h2>
              <p className="text-sm text-muted" style={{margin: "0 0 20px"}}>You can change these later, and create more pairs.</p>
              <label className="label">You speak (source)</label>
              <LanguagePicker value={locale} onChange={setLocale}/>
              <div style={{height: 14}}/>
              <label className="label">Viewers read (target)</label>
              <LanguagePicker value={target} onChange={setTarget}/>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-h3" style={{margin: "0 0 6px"}}>Add your Deepgram key</h2>
              <p className="text-sm text-muted" style={{margin: "0 0 20px"}}>
                We'll route your mic to Deepgram for streaming transcription. <a style={{color: "var(--color-accent)"}}>Where do I get this? <Icon name="externalLink" size={11} style={{verticalAlign: 0}}/></a>
              </p>
              <label className="label">Deepgram API key</label>
              <input className="input mono" type="password" placeholder="dg_xxxx_xxxxxxxxxxxxxxxx"
                     value={dgKey} onChange={e => setDgKey(e.target.value)}/>
              <p className="helper">Your key is encrypted at rest. We only decrypt it when a session opens.</p>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-h3" style={{margin: "0 0 6px"}}>Add your DeepL key</h2>
              <p className="text-sm text-muted" style={{margin: "0 0 20px"}}>
                We'll send transcripts to DeepL for translation. <a style={{color: "var(--color-accent)"}}>Where do I get this? <Icon name="externalLink" size={11} style={{verticalAlign: 0}}/></a>
              </p>
              <label className="label">DeepL API key</label>
              <input className="input mono" type="password" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"
                     value={dlKey} onChange={e => setDlKey(e.target.value)}/>
              <p className="helper">Free, Pro, and Enterprise plans all work. We auto-detect the tier from the suffix.</p>
            </>
          )}

          <div style={{display: "flex", gap: 8, marginTop: 24, justifyContent:"space-between"}}>
            <Button variant="ghost" disabled={step === 0} onClick={back} iconLeft="arrowLeft">Back</Button>
            <Button variant="primary" onClick={next} iconRight={step === 2 ? "check" : "arrowRight"}>
              {step === 2 ? "Finish" : "Continue"}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted" style={{textAlign:"center", marginTop: 16}}>
          <a style={{cursor:"pointer"}} onClick={() => onNav("/dashboard")}>Skip for now →</a>
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage, OnboardingPage });
