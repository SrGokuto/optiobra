class IntelligenceError(Exception):
    """Base exception for the intelligence engine."""

    def __init__(self, error: str, message: str) -> None:
        self.error = error
        self.message = message
        super().__init__(message)


class InvalidContextError(IntelligenceError):
    """Raised when the request context is invalid."""

    def __init__(self, message: str = "Invalid context provided") -> None:
        super().__init__("INVALID_CONTEXT", message)


class LLMTimeoutError(IntelligenceError):
    """Raised when the LLM request times out."""

    def __init__(self, message: str = "LLM request timed out") -> None:
        super().__init__("LLM_TIMEOUT", message)


class LLMUnavailableError(IntelligenceError):
    """Raised when the LLM server is unavailable."""

    def __init__(self, message: str = "LLM server is unavailable") -> None:
        super().__init__("LLM_UNAVAILABLE", message)


class InvalidOutputError(IntelligenceError):
    """Raised when the LLM output is invalid."""

    def __init__(self, message: str = "Invalid output from LLM") -> None:
        super().__init__("INVALID_OUTPUT", message)


class ModelNotLoadedError(IntelligenceError):
    """Raised when the model is not loaded."""

    def __init__(self, message: str = "Model is not loaded") -> None:
        super().__init__("MODEL_NOT_LOADED", message)
