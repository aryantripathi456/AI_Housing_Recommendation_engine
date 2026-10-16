"""Module 5 — Financial affordability evaluator (synopsis § Key Module 5)."""

from app.core.config import AFFORDABILITY_BANDS

_AFFORDABLE = AFFORDABILITY_BANDS['affordable_limit']   # 0.30
_MODERATE = AFFORDABILITY_BANDS['moderate_limit']       # 0.40


def estimate_emi(principal_inr: int, annual_rate: float = 0.09,
                 years: int = 20, down_payment_share: float = 0.2) -> float:
    """Standard amortising home-loan EMI on the financed amount."""
    loan = principal_inr * (1.0 - down_payment_share)
    r = annual_rate / 12.0
    n = years * 12
    if r <= 0:
        return loan / n
    factor = (1 + r) ** n
    return loan * r * factor / (factor - 1)


def evaluate(price_inr: int, monthly_income: float,
             listing_type: str = 'rent') -> dict:
    if monthly_income <= 0:
        raise ValueError('monthly_income must be positive')
    if listing_type == 'sale':
        emi = estimate_emi(price_inr)
        ratio = emi / monthly_income
        if ratio <= _AFFORDABLE:
            band, advice = 'Affordable', (
                f'Est. EMI ₹{emi:,.0f}/mo is {ratio:.0%} of income — comfortably '
                'within the 30% safety threshold (20% down, 9% / 20yr assumption).'
            )
        elif ratio <= _MODERATE:
            band, advice = 'Moderate Risk', (
                f'Est. EMI ₹{emi:,.0f}/mo is {ratio:.0%} of income — workable if '
                'other expenses are controlled. Consider a larger down payment.'
            )
        else:
            band, advice = 'Over Budget', (
                f'Est. EMI ₹{emi:,.0f}/mo is {ratio:.0%} of income — well above '
                'the 30–35% safety band. Filter for lower purchase prices.'
            )
        return {
            'price': price_inr,
            'monthly_income': monthly_income,
            'rent_to_income': round(ratio, 3),
            'band': band,
            'advice': advice,
        }
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
