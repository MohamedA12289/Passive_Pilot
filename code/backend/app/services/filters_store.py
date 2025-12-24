import json
from app.schemas.filters import FilterSpec


def parse_filter_spec(json_str: str | None) -> FilterSpec:
    if not json_str:
        return FilterSpec()
    try:
        data = json.loads(json_str)
        if not isinstance(data, dict):
            return FilterSpec()
        return FilterSpec(**data)
    except Exception:
        return FilterSpec()


def dump_filter_spec(spec: FilterSpec) -> str:
    # exclude None so saved JSON is clean
    return spec.model_dump_json(exclude_none=True)
