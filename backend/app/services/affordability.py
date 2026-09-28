"""Module 5 — Financial affordability evaluator (synopsis § Key Module 5)."""

from app.core.config import AFFORDABILITY_BANDS

_AFFORDABLE = AFFORDABILITY_BANDS['affordable_limit']   # 0.30
_MODERATE = AFFORDABILITY_BANDS['moderate_limit']       # 0.40


def evaluate(price_inr: int, monthly_income: float) -> dict:
    if monthly_income <= 0:
        raise ValueError('monthly_income must be positive')
    ratio = price_inr / monthly_income
    if ratio <= _AFFORDABLE:
        band, advice = 'Affordable', (
            f'Rent is {ratio:.0%} of income — comfortably within the 30% safety '
            'threshold. This home leaves healthy room for savings and expenses.'
        )
    elif ratio <= _MODERATE:
        band, advice = 'Moderate Risk', (
            f'Rent is {ratio:.0%} of income — above the 30% guideline but workable '
            'if other expenses are controlled. Consider negotiating or sharing.'
        )
    else:
        band, advice = 'Over Budget', (
            f'Rent is {ratio:.0%} of income — well above the 30–35% safety band. '
            'This home is likely to strain monthly finances; filter for lower rents.'
        )
    return {
        'price': price_inr,
        'monthly_income': monthly_income,
        'rent_to_income': round(ratio, 3),
        'band': band,
        'advice': advice,
    }
