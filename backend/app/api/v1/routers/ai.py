from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.services.ai_copilot import ai_copilot

router = APIRouter(prefix="/ai", tags=["ThreatLens AI Intelligence Suite"])

class AIChatRequest(BaseModel):
    message: str
    sample_context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[list] = None

class AIRemediationRequest(BaseModel):
    sample_context: Dict[str, Any]

class AIYARASigmaRequest(BaseModel):
    sample_context: Dict[str, Any]

class AIDecompileRequest(BaseModel):
    code_snippet: Optional[str] = None
    sample_context: Optional[Dict[str, Any]] = None

@router.post("/copilot/chat")
def copilot_chat(req: AIChatRequest):
    """
    Interactive ThreatLens AI SOC Copilot chat endpoint.
    """
    try:
        return ai_copilot.process_chat_message(
            message=req.message,
            sample_context=req.sample_context,
            conversation_history=req.conversation_history
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Copilot generation error: {str(e)}")

@router.post("/generate/remediation")
def generate_remediation(req: AIRemediationRequest):
    """
    Automated generation of PowerShell, Bash, Snort, and SIEM containment scripts.
    """
    return ai_copilot.generate_remediation_suite(req.sample_context)

@router.post("/generate/yara-sigma")
def generate_yara_sigma(req: AIYARASigmaRequest):
    """
    Synthesizes custom YARA signatures and Sigma detection rules.
    """
    return ai_copilot.generate_yara_and_sigma(req.sample_context)

@router.post("/decompile/explain")
def decompile_explain(req: AIDecompileRequest):
    """
    Decompiles and explains disassembly bytecode and malicious execution flow.
    """
    return ai_copilot.decompile_and_explain(req.code_snippet, req.sample_context)

@router.get("/voice-briefing/{sample_id}")
def get_voice_briefing(sample_id: str):
    """
    Generates SOC Voice Incident Briefing audio text and phonetic parameters.
    """
    mock_context = {
        "filename": f"sample_{sample_id}.exe",
        "classification": "Ransomware.LockBit",
        "risk_score": 92,
        "media_type": "executable binary"
    }
    return ai_copilot.generate_voice_briefing(mock_context)
