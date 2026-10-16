describe("template spec", () => {
  it("passes", () => {
    describe("Login Page", () => {
      it("Visit halaman login", () => {
        describe("Login Page", () => {
          it("Visit halaman login", () => {
            describe("Login Page", () => {
              it("Visit halaman login", () => {
                describe("Login Page", () => {
                  it("Visit halaman login", () => {
                    describe("Login Test", () => {
                      it("Login berhasil", () => {
                        describe("Login Test", () => {
                          it("Login berhasil", () => {
                            describe("Login Test", () => {
                              it("Login berhasil", () => {
                                describe("Login Page", () => {
                                  it("Visit halaman login", () => {
                                    describe("Login Page", () => {
                                      it("Visit halaman login", () => {
                                        describe("Login Page", () => {
                                          it("Visit halaman login", () => {
                                            describe("Login Page", () => {
                                              it("Visit halaman login", () => {
                                                describe("Login Test", () => {
                                                  it("Login berhasil", () => {
                                                    describe("Login Test", () => {
                                                      it("Login berhasil", () => {
                                                        describe("Login Test", () => {
                                                          it("Login berhasil", () => {
                                                            cy.visit(
                                                              "http://localhost:3002/login",
                                                            );
                                                            cy.get(
                                                              "input[name=username]",
                                                            ).type("dezze123");
                                                            cy.get(
                                                              "input[name=password]",
                                                            ).type(
                                                              "passwor123",
                                                            );
                                                            cy.contains(
                                                              "Masuk",
                                                            ).click();
                                                            cy.url().should(
                                                              "include",
                                                              "/dashboard",
                                                            );
                                                          });
                                                        });
                                                      });
                                                    });
                                                  });
                                                });
                                              });
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
