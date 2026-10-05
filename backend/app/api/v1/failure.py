from fastapi import APIRouter
from app.schemas.domain_schemas import FailureConfigSchema
from app.domain.failure_simulator import global_failure_simulator

router = APIRouter(prefix="/failure", tags=["Failure Simulator"])

@router.get("/config", response_model=FailureConfigSchema)
async def get_failure_config():
    return global_failure_simulator.config

@router.post("/config", response_model=FailureConfigSchema)
async def update_failure_config(config: FailureConfigSchema):
    global_failure_simulator.update_config(config)
    return global_failure_simulator.config

@router.post("/payment")
async def toggle_payment_failure(enable: bool = True):
    global_failure_simulator.config.payment_gateway_failure = enable
    return {"status": "updated", "payment_gateway_failure": enable}

@router.post("/order-service")
async def toggle_order_service_failure(enable: bool = True):
    global_failure_simulator.config.order_service_down = enable
    return {"status": "updated", "order_service_down": enable}

@router.post("/database")
async def toggle_database_failure(enable: bool = True):
    global_failure_simulator.config.database_failure = enable
    return {"status": "updated", "database_failure": enable}
