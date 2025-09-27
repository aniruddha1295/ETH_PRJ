pub contract PortfolioManager {
    pub event PortfolioCreated(id: UInt64, owner: Address)
    pub var nextPortfolioId: UInt64

    pub resource Portfolio {
        pub let id: UInt64
        init(owner: Address) {
            self.id = PortfolioManager.nextPortfolioId
            PortfolioManager.nextPortfolioId = self.id + 1
            emit PortfolioCreated(self.id, owner)
        }
    }

    pub fun createPortfolio(owner: Address): @Portfolio {
        return <- create Portfolio(owner: owner)
    }

    init() {
        self.nextPortfolioId = 1
    }
}

