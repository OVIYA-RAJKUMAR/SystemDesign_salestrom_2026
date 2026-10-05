from fastapi import APIRouter
from app.schemas.domain_schemas import SimulationRequestSchema, SimulationResultSchema
from app.services.simulation_service import SimulationService

router = APIRouter(prefix="/flash-sale", tags=["Simulation"])

@router.post("/simulate", response_model=SimulationResultSchema)
async def run_flash_sale_simulation(req: SimulationRequestSchema):
    service = SimulationService()
    result = await service.run_simulation(req)
    return result
