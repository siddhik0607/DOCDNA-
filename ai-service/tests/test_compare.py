from app.main import compute_changes, compute_similarity, compute_trust_score


def test_field_changes_detected():
    original = "Salary: INR 10000\nJoining Date: 12/06/2026"
    candidate = "Salary: INR 20000\nJoining Date: 20/06/2026"
    changes = compute_changes(original, candidate)
    assert changes == [
        {"field": "Salary", "oldValue": "INR 10000", "newValue": "INR 20000"},
        {"field": "Joining Date", "oldValue": "12/06/2026", "newValue": "20/06/2026"},
    ]


def test_trust_score_drops_with_changes():
    similarity = compute_similarity("Salary: 10000", "Salary: 20000")
    trust = compute_trust_score(similarity, 1)
    assert trust < 100
