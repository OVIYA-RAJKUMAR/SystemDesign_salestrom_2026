from typing import Dict
from app.schemas.domain_schemas import FailureConfigSchema

class FailureSimulator:
    def __init__(self):
        self.config = FailureConfigSchema()

    def update_config(self, new_config: FailureConfigSchema):
        self.config = new_config

    def is_failed(self, feature_name: str) -> bool:
        return getattr(self.config, feature_name, False)

    def get_dict(self) -> Dict[str, bool]:
        return self.config.model_dump()

global_failure_simulator = FailureSimulator()
